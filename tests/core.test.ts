import { describe, it, expect } from "vitest";
import { classifyCourse, parseCatalog } from "../src/lib/content";
import {
  emptyProgress,
  scheduleReview,
  saveResult,
  streak,
} from "../src/lib/progress";
import { CATALOG_KEY, mergeCatalog, resolveCatalog } from "../src/lib/storage";
import sourceManifest from "../content/sources/manifest.json";
import { newerVersion, parseRepository } from "../src/lib/updates";
import bundled from "../public/courses/catalog.json";
describe("Content integrity", () => {
  it("integrates all eleven supplied PDFs into the two new subjects", () => {
    const c = parseCatalog(bundled);
    expect(c.edition).toBe("s1-2026");
    expect(c.subjects.map((s) => s.id)).toEqual(["realites-immersives", "intelligence-artificielle"]);
    const chapters = c.subjects.flatMap((s) => s.chapters);
    expect(chapters).toHaveLength(16);
    expect(chapters.flatMap((c) => c.cards)).toHaveLength(198);
    const referenced = new Set(chapters.flatMap((c) => c.references?.map((r) => r.document) || []));
    expect(sourceManifest).toHaveLength(11);
    for (const source of sourceManifest) {
      expect(referenced.has(source.file.split("/").at(-1)!)).toBe(true);
      expect(source.reviewed).toBe(true);
    }
    expect(sourceManifest.reduce((n, s) => n + s.pages, 0)).toBe(269);
    expect(chapters.every((c) => c.exams.length > 0 && c.sections.length >= 3)).toBe(true);
    expect(chapters.every((c) => c.cards.length >= 10)).toBe(true);
    for (const chapter of chapters)
      for (const card of chapter.cards)
        expect(card.choices[card.correct]).toBe(card.answer);
  });
  it("rejects duplicate identifiers and executable source links", () => {
    const duplicate = structuredClone(bundled);
    duplicate.subjects[1].chapters[0].id = duplicate.subjects[0].chapters[0].id;
    expect(() => parseCatalog(duplicate)).toThrow();
    const malicious = structuredClone(bundled);
    malicious.subjects[0].sources[0].url = "javascript:alert(1)";
    expect(() => parseCatalog(malicious)).toThrow();
  });
  it("merges new chapters while preserving local additions", () => {
    const base = parseCatalog(bundled);
    const custom = structuredClone(base.subjects[0].chapters[0]);
    custom.id = "local-chapter";
    custom.cards = custom.cards.map((c) => ({ ...c, id: `local-${c.id}` }));
    custom.exams = custom.exams.map((e) => ({ ...e, id: `local-${e.id}` }));
    base.subjects[0].chapters.push(custom);
    const update = parseCatalog(bundled);
    update.version = base.version + 1;
    update.subjects[0].chapters[0].title = "Updated";
    const merged = mergeCatalog(base, update);
    expect(merged.subjects[0].chapters).toHaveLength(9);
    expect(merged.subjects[0].chapters[0].title).toBe("Updated");
    expect(merged.version).toBe(update.version);
  });
  it("classifies distinctive vocabulary and leaves ambiguity explicit", () => {
    expect(classifyCourse("Réalité augmentée, tracking et Vuforia")).toBe("realites-immersives");
    expect(classifyCourse("Machine Learning, classification et Gini")).toBe("intelligence-artificielle");
    expect(classifyCourse("VLAN trunk 802.1Q")).toBeNull();
    expect(classifyCourse("Introduction générale")).toBeNull();
    expect(classifyCourse("Vuforia et KNN")).toBeNull();
  });
  it("keeps edition caches separate and refuses cross-edition merges regardless of version", () => {
    const current = parseCatalog(bundled);
    const legacy = { ...structuredClone(current), edition: "original", version: 99 };
    expect(CATALOG_KEY).toBe("memora.catalog.s1-2026");
    expect(resolveCatalog(current, legacy)).toEqual(current);
    expect(() => mergeCatalog(current, legacy)).toThrow("autre édition");
    const newer = { ...structuredClone(current), version: 4 };
    expect(resolveCatalog(current, newer)).toEqual(newer);
  });
  it("rejects a choice that contradicts the declared answer", () => {
    const bad = structuredClone(bundled);
    bad.subjects[0].chapters[0].cards[0].correct = 1;
    expect(() => parseCatalog(bad)).toThrow("Réponse incohérente");
  });
});
describe("Progress and spaced repetition", () => {
  it("schedules failures soon and spaces successful recall", () => {
    const first = scheduleReview(undefined, "good", 1000);
    expect(first.interval).toBe(1);
    expect(first.due).toBe(86401000);
    const second = scheduleReview(first, "good", 86401000);
    expect(second.interval).toBe(2);
    expect(scheduleReview(second, "easy", 1000).interval).toBe(6);
    expect(scheduleReview(second, "again", 1000)).toMatchObject({
      due: 601000,
      interval: 0,
      repetitions: 0,
    });
  });
  it("does not count an uncompleted day as a broken streak", () => {
    expect(
      streak({ "2026-11-03": 2, "2026-11-04": 1 }, new Date(2026, 10, 5, 12)),
    ).toBe(2);
    expect(streak({ "2026-11-03": 2 }, new Date(2026, 10, 5, 12))).toBe(0);
  });
  it("does not duplicate a submitted exam result", () => {
    const result = {
      id: "same-exam",
      mode: "exam" as const,
      title: "Réalités immersives",
      date: 10,
      score: 75,
      total: 1,
    };
    expect(
      saveResult(saveResult(emptyProgress, result), result).results,
    ).toHaveLength(1);
  });
});
describe("Update boundaries", () => {
  it("uses semantic version comparison and excludes prereleases", () => {
    expect(newerVersion("v1.10.0", "1.9.9")).toBe(true);
    expect(newerVersion("v1.0.0", "1.0.0")).toBe(false);
    expect(newerVersion("v2.0.0-beta", "1.0.0")).toBe(false);
    expect(newerVersion("garbage", "1.0.0")).toBe(false);
  });
  it("accepts a GitHub URL and rejects paths or other hosts", () => {
    expect(parseRepository("https://github.com/owner/memora.git")).toBe(
      "owner/memora",
    );
    expect(() => parseRepository("https://evil.example/owner/repo")).toThrow();
    expect(() => parseRepository("owner/repo/../../bad")).toThrow();
  });
});
