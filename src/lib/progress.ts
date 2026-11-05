import { z } from "zod";
import { Capacitor, registerPlugin } from "@capacitor/core";
export const reviewSchema = z.object({
  due: z.number().finite(),
  interval: z.number().nonnegative(),
  repetitions: z.number().int().nonnegative(),
  lastReviewed: z.number().finite(),
});
export const resultSchema = z.object({
  id: z.string(),
  mode: z.enum(["quiz", "exam", "qa", "flashcards"]),
  title: z.string(),
  date: z.number().finite(),
  score: z.number().min(0).max(100),
  total: z.number().int().positive(),
});
export const progressSchema = z.object({
  version: z.literal(1),
  name: z.string().max(40),
  goal: z.number().int().min(5).max(50),
  read: z.array(z.string()),
  favorites: z.array(z.string()),
  reviews: z.record(z.string(), reviewSchema),
  activity: z.record(z.string(), z.number().int().nonnegative()),
  results: z.array(resultSchema).max(500),
  lastChapter: z.string().nullable(),
  repository: z.string().max(160),
});
export type Progress = z.infer<typeof progressSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Result = z.infer<typeof resultSchema>;
export const emptyProgress: Progress = {
  version: 1,
  name: "",
  goal: 10,
  read: [],
  favorites: [],
  reviews: {},
  activity: {},
  results: [],
  lastChapter: null,
  repository: import.meta.env.VITE_GITHUB_REPOSITORY || "",
};
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function scheduleReview(
  previous: Review | undefined,
  grade: "again" | "hard" | "good" | "easy",
  now = Date.now(),
): Review {
  if (grade === "again")
    return {
      due: now + 600000,
      interval: 0,
      repetitions: 0,
      lastReviewed: now,
    };
  const old = previous?.interval || 0;
  const interval =
    grade === "hard"
      ? Math.max(1, Math.round(old * 1.2))
      : grade === "easy"
        ? Math.max(4, Math.round(old * 2.8))
        : Math.max(1, Math.round(old * 2));
  return {
    due: now + interval * 86400000,
    interval,
    repetitions: (previous?.repetitions || 0) + 1,
    lastReviewed: now,
  };
}
export function addActivity(p: Progress, amount = 1): Progress {
  const day = dayKey();
  return {
    ...p,
    activity: { ...p.activity, [day]: (p.activity[day] || 0) + amount },
  };
}
export function streak(
  activity: Progress["activity"],
  now = new Date(),
): number {
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!activity[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  let days = 0;
  while (activity[dayKey(cursor)]) {
    days++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return days;
}
export function saveResult(p: Progress, result: Result): Progress {
  if (p.results.some((r) => r.id === result.id)) return p;
  return { ...p, results: [result, ...p.results].slice(0, 500) };
}
export function downloadJson(data: unknown, name: string) {
  if (Capacitor.getPlatform() === "android") {
    const files = registerPlugin<{
      exportJson(options: { name: string; data: string }): Promise<void>;
    }>("AppFiles");
    void files
      .exportJson({ name, data: JSON.stringify(data, null, 2) })
      .catch(() =>
        window.alert(
          "Impossible d’enregistrer le fichier. Réessaie avec une autre destination.",
        ),
      );
    return;
  }
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
