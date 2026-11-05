import type { Config } from "@netlify/functions";
import { blobStore } from "../../server/store";
export default async () => {
  const store = blobStore();
  const now = Date.now();
  for (const prefix of ["rooms/", "invites/", "limits/", "feedback/"]) {
    for (const key of await store.list(prefix)) {
      const item = await store.read<{ expiresAt?: number }>(key);
      if (item?.data.expiresAt && item.data.expiresAt < now - 3600000)
        await store.remove(key);
    }
  }
  return new Response("Expired game data removed");
};
export const config: Config = { schedule: "17 3 * * *" };
