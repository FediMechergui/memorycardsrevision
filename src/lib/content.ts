import { z } from "zod";

const text = z.string().trim().min(1).max(12000);
const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
const link = z
  .string()
  .url()
  .refine((s) => s.startsWith("https://"), "Une source doit utiliser HTTPS.");
export const cardSchema = z.object({
  id,
  question: text,
  answer: text,
  choices: z.array(text).length(4),
  correct: z.number().int().min(0).max(3),
  explanation: text,
});
export const examSchema = z.object({
  id,
  question: text,
  modelAnswer: text,
  rubric: z.array(text).min(1).max(8),
});
export const chapterSchema = z.object({
  id,
  title: text,
  description: text,
  minutes: z.number().int().min(1).max(180),
  sections: z
    .array(
      z.object({
        title: text,
        body: text,
        bullets: z.array(text).max(12).optional(),
        code: text.optional(),
      }),
    )
    .min(1)
    .max(30),
  takeaway: text,
  cards: z.array(cardSchema).min(1).max(100),
  exams: z.array(examSchema).min(1).max(30),
});
export const subjectSchema = z.object({
  id,
  title: text,
  subtitle: text,
  description: text,
  color: z.enum(["mint", "lavender", "peach", "blue"]),
  icon: z.enum(["network", "router", "code", "book"]),
  sources: z.array(z.object({ title: text, url: link })).max(20),
  chapters: z.array(chapterSchema).min(1).max(100),
});
export const catalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    version: z.number().int().positive(),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    subjects: z.array(subjectSchema).min(1).max(50),
  })
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    for (const subject of value.subjects) {
      for (const key of [
        subject.id,
        ...subject.chapters.flatMap((c) => [
          c.id,
          ...c.cards.map((x) => x.id),
          ...c.exams.map((x) => x.id),
        ]),
      ]) {
        if (ids.has(key))
          ctx.addIssue({
            code: "custom",
            message: `Identifiant dupliqué : ${key}`,
          });
        ids.add(key);
      }
      for (const chapter of subject.chapters)
        for (const card of chapter.cards) {
          if (new Set(card.choices).size !== 4)
            ctx.addIssue({
              code: "custom",
              message: `Choix dupliqués : ${card.id}`,
            });
        }
    }
  });
export type Catalog = z.infer<typeof catalogSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Exam = z.infer<typeof examSchema>;
export function parseCatalog(input: unknown): Catalog {
  return catalogSchema.parse(input);
}
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function classifyCourse(input: string): string | null {
  const content = normalize(input);
  const rules: Record<string, string[]> = {
    javafx: [
      "javafx",
      "fxml",
      "scene builder",
      "observablelist",
      "borderpane",
      "scenegraph",
      "application thread",
    ],
    ccna2: [
      "vlan",
      "spanning tree",
      "etherchannel",
      "inter-vlan",
      "dhcp",
      "wlan",
      "route statique",
      "802.1q",
      "hsrp",
    ],
    ccna1: [
      "osi",
      "tcp/ip",
      "ipv4",
      "ipv6",
      "ethernet",
      "adresse mac",
      "sous-reseau",
      "encapsulation",
      "arp",
    ],
  };
  const scores = Object.entries(rules)
    .map(([key, terms]) => ({
      key,
      score: terms.filter((t) => content.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);
  return scores[0].score > 0 && scores[0].score > scores[1].score
    ? scores[0].key
    : null;
}
