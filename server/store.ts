import { getStore } from "@netlify/blobs";
import { GameError } from "./game";

export interface DataStore {
  read<T>(key: string): Promise<{ data: T; etag: string } | null>;
  write(key: string, data: unknown, etag?: string): Promise<boolean>;
  list(prefix: string): Promise<string[]>;
  remove(key: string): Promise<void>;
}
export function blobStore(): DataStore {
  const store = getStore({
    name: "memora-classroom-v1",
    consistency: "strong",
  });
  return {
    read: async <T>(key: string) => {
      const item = await store.getWithMetadata(key, { type: "json" });
      if (item && !item.etag)
        throw new Error("Storage read has no concurrency token");
      return item ? { data: item.data as T, etag: item.etag! } : null;
    },
    write: async (key, value, etag) => {
      const result = await store.setJSON(
        key,
        value,
        etag ? { onlyIfMatch: etag } : { onlyIfNew: true },
      );
      if (result.modified && !result.etag)
        throw new Error("Storage write was not acknowledged");
      return result.modified;
    },
    list: async (prefix) => {
      const result = await store.list({ prefix });
      return result.blobs.map((b) => b.key);
    },
    remove: (key) => store.delete(key),
  };
}
// All game transitions use one room document. Conditional writes serialize concurrent
// answers; no scores or state are updated across several keys in a transaction.
export async function change<T>(
  store: DataStore,
  key: string,
  mutate: (value: T) => void,
): Promise<T> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const item = await store.read<T>(key);
    if (!item) throw new GameError("Élément introuvable ou expiré.", 404);
    mutate(item.data);
    if (await store.write(key, item.data, item.etag)) return item.data;
    await new Promise((resolve) =>
      setTimeout(resolve, 15 + Math.random() * 45),
    );
  }
  throw new GameError("La salle est occupée. Réessaie dans un instant.", 409);
}
