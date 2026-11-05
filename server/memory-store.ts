import type { DataStore } from "./store";
// Explicitly used only by local development and tests. Production uses Netlify Blobs.
export function memoryStore(): DataStore {
  const data = new Map<string, { data: unknown; etag: string }>();
  let version = 0;
  return {
    read: async <T>(key: string) =>
      structuredClone(data.get(key) || null) as {
        data: T;
        etag: string;
      } | null,
    write: async (key, value, etag) => {
      const current = data.get(key);
      if (etag ? current?.etag !== etag : !!current) return false;
      data.set(key, { data: structuredClone(value), etag: String(++version) });
      return true;
    },
    list: async (prefix) =>
      [...data.keys()].filter((k) => k.startsWith(prefix)),
    remove: async (key) => {
      data.delete(key);
    },
  };
}
