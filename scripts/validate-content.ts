import { readFileSync } from "node:fs";
import { parseCatalog } from "../src/lib/content";
const catalog = parseCatalog(
  JSON.parse(readFileSync("public/courses/catalog.json", "utf8")),
);
const chapters = catalog.subjects.flatMap((s) => s.chapters);
console.log(
  `${catalog.subjects.length} matières, ${chapters.length} chapitres, ${chapters.flatMap((c) => c.cards).length} cartes/quiz, ${chapters.flatMap((c) => c.exams).length} sujets d’examen. Catalogue valide.`,
);
