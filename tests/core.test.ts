import { describe, it, expect } from "vitest";
import { classifyCourse, parseCatalog } from "../src/lib/content";
import {
  emptyProgress,
  scheduleReview,
  saveResult,
  streak,
} from "../src/lib/progress";
import { mergeCatalog } from "../src/lib/storage";
import { newerVersion, parseRepository } from "../src/lib/updates";
import bundled from "../public/courses/catalog.json";
describe("Content integrity", () => {
  it("ships complete learning material for the three subjects", () => {
    const c = parseCatalog(bundled);
    expect(c.subjects.map((s) => s.id)).toEqual(["ccna1", "ccna2", "javafx"]);
    const chapters = c.subjects.flatMap((s) => s.chapters);
    expect(chapters).toHaveLength(18);
    expect(chapters.flatMap((c) => c.cards)).toHaveLength(72);
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
    update.version = 2;
    update.subjects[0].chapters[0].title = "Updated";
    const merged = mergeCatalog(base, update);
    expect(merged.subjects[0].chapters).toHaveLength(7);
    expect(merged.subjects[0].chapters[0].title).toBe("Updated");
    expect(merged.version).toBe(2);
  });
  it("classifies distinctive vocabulary and leaves ambiguity explicit", () => {
    expect(classifyCourse("FXML et JavaFX avec ObservableList")).toBe("javafx");
    expect(classifyCourse("VLAN trunk 802.1Q")).toBe("ccna2");
    expect(classifyCourse("IPv4 et encapsulation OSI")).toBe("ccna1");
    expect(classifyCourse("Introduction générale")).toBeNull();
    expect(classifyCourse("JavaFX et VLAN")).toBeNull();
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
      title: "CCNA",
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
