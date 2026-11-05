import { mkdirSync, writeFileSync } from "node:fs";
import { ccna1 } from "../content/ccna1";
import { ccna2 } from "../content/ccna2";
import { javafx } from "../content/javafx";
import { parseCatalog } from "../src/lib/content";
import { enrich } from "../content/enrichment";
const catalog = parseCatalog({
  schemaVersion: 1,
  version: 2,
  updatedAt: "2026-11-06",
  subjects: [ccna1, ccna2, javafx].map(enrich),
});
mkdirSync("public/courses", { recursive: true });
writeFileSync(
  "public/courses/catalog.json",
  JSON.stringify(catalog, null, 2) + "\n",
  "utf8",
);
console.log("Catalogue Mémora généré.");
