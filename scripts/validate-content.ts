import { readFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { parseCatalog } from "../src/lib/content";
const catalog = parseCatalog(
  JSON.parse(readFileSync("public/courses/catalog.json", "utf8")),
);
const chapters = catalog.subjects.flatMap((s) => s.chapters);
const manifest = JSON.parse(readFileSync("content/sources/manifest.json", "utf8")) as {
  file: string; pages: number; sha256: string; reviewed: boolean;
}[];
const referenced = new Set(chapters.flatMap((c) => c.references?.map((r) => r.document) || []));
for (const source of manifest) {
  const path = join("content/sources", source.file);
  if (!source.reviewed || !referenced.has(basename(source.file)))
    throw new Error(`Source non relue ou non intégrée : ${source.file}`);
  if (!existsSync(path) || createHash("sha256").update(readFileSync(path)).digest("hex") !== source.sha256)
    throw new Error(`Source manquante ou modifiée : ${source.file}`);
}
for (const chapter of chapters) {
  if (chapter.cards.length < 10) throw new Error(`Dix cartes nécessaires pour le salon : ${chapter.id}`);
  if (!chapter.references?.length) throw new Error(`Référence de cours manquante : ${chapter.id}`);
}
console.log(
  `${catalog.subjects.length} matières, ${chapters.length} chapitres, ${chapters.flatMap((c) => c.cards).length} cartes/quiz, ${chapters.flatMap((c) => c.exams).length} sujets d’examen. Catalogue valide.`,
);
