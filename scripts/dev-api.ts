import { createServer } from "node:http";
import { handleApi } from "../server/api";
import { memoryStore } from "../server/memory-store";
const store = memoryStore();
createServer(async (incoming, outgoing) => {
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of incoming) {
      chunks.push(Buffer.from(chunk));
      if (chunks.reduce((s, c) => s + c.length, 0) > 40000) {
        outgoing.writeHead(413).end();
        return;
      }
    }
    const request = new Request(`http://127.0.0.1:8788${incoming.url}`, {
      method: incoming.method,
      headers: incoming.headers as Record<string, string>,
      ...(!["GET", "HEAD"].includes(incoming.method || "GET")
        ? { body: Buffer.concat(chunks) }
        : {}),
    });
    const response = await handleApi(request, {
      store,
      ip: incoming.socket.remoteAddress,
      aiKey: process.env.OPENROUTER_API_KEY,
    });
    outgoing.writeHead(
      response.status,
      Object.fromEntries(response.headers.entries()),
    );
    outgoing.end(await response.text());
  } catch {
    outgoing.writeHead(500).end("Local API error");
  }
}).listen(8788, "127.0.0.1", () =>
  console.log("Mémora local API: http://127.0.0.1:8788 (memory only)"),
);
