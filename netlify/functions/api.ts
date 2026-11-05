import type { Config, Context } from "@netlify/functions";
import { handleApi } from "../../server/api";
import { blobStore } from "../../server/store";
export default (req: Request, context: Context) =>
  handleApi(req, {
    store: blobStore(),
    ip: context.ip,
    aiKey: process.env.OPENROUTER_API_KEY,
  });
export const config: Config = { path: "/api/*" };
