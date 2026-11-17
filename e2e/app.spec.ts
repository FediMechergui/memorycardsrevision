import { test, expect } from "@playwright/test";
import catalog from "../public/courses/catalog.json" with { type: "json" };
test("new edition leaves the legacy catalogue and progress intact", async ({ page }) => {
  const legacy = { ...structuredClone(catalog), edition: "original", version: 99 };
  legacy.subjects[0].id = "ccna1";
  legacy.subjects[0].title = "CCNA 1";
  const progress = { version: 1, name: "Lina", goal: 10, read: ["c1-reseaux"],
    favorites: ["c1-reseaux-q1"], reviews: { "c1-reseaux-q1": { due: 999, interval: 4, repetitions: 2, lastReviewed: 1 } },
    activity: { "2026-11-01": 2 }, results: [], lastChapter: "c1-reseaux", repository: "test/memora" };
  await page.addInitScript(({ legacy, progress }) => {
    if (!localStorage.getItem("memora.progress.v1")) {
      localStorage.setItem("memora.catalog.v1", JSON.stringify(legacy));
      localStorage.setItem("memora.progress.v1", JSON.stringify(progress));
    }
  }, { legacy, progress });
  await page.goto("/");
  await expect(page.locator(".course-card")).toHaveCount(2);
  await expect(page.locator(".course-card")).toContainText(["Réalités immersives", "Intelligence artificielle"]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("memora.progress.v1")!))).toEqual(progress);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("memora.catalog.v1")!))).toEqual(legacy);
  await page.goto("/#/learn/ra-immersif");
  await page.getByRole("button", { name: "J’ai compris ce chapitre" }).click();
  await page.reload();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("memora.progress.v1")!));
  expect(after.read).toEqual(["c1-reseaux", "ra-immersif"]);
  expect(after.favorites).toEqual(progress.favorites);
  expect(after.reviews).toEqual(progress.reviews);
});
test("source references and practical solutions are available offline without awarding points", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/learn/ia-donnees");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.locator(".lesson-references summary").click();
  await expect(page.locator(".lesson-references")).toContainText("Chapitre2_de_L_IA_au_ML_Final.pdf");
  await expect(page.locator(".lesson-section").filter({ hasText: "Recalculer le cas clients" })).toContainText("Rectification explicitée");
  await page.getByText("Voir la proposition de solution", { exact: true }).click();
  await expect(page.locator(".guided-practical code")).toContainText("assert len(df) == 5");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("memora.progress.v1")!).activity)).toEqual({});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/practical-mobile.png", fullPage: true });
  await context.setOffline(false);
});
test("dashboard, lesson completion, favorite and spaced review survive reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Bonjour." })).toBeVisible();
  await expect(page.locator(".course-card")).toHaveCount(2);
  await page.locator(".course-card").first().click();
  await page.getByRole("button", { name: "Commencer à apprendre" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Comprendre les technologies immersives",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "J’ai compris ce chapitre" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Chapitre terminé" }),
  ).toBeDisabled();
  await page.locator(".lesson-mode").filter({ hasText: "Flashcards" }).click();
  await page.getByRole("button", { name: "Ajouter aux favoris" }).click();
  await page
    .getByRole("button", { name: "Voir la réponse", exact: true })
    .click();
  await page.getByRole("button", { name: "Facile Bien ancrée" }).click();
  await page.reload();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("memora.progress.v1")!),
  );
  expect(saved.favorites).toHaveLength(1);
  expect(Object.values(saved.reviews)).toHaveLength(1);
  expect(saved.read).toContain("ra-immersif");
});
test("quiz explains answers, blocks changing a choice, and saves a real score", async ({
  page,
}) => {
  await page.goto("/#/study/quiz/ra-immersif");
  for (let i = 0; i < catalog.subjects[0].chapters[0].cards.length; i++) {
    const question = await page.locator(".question-area h2").innerText();
    const card = catalog.subjects[0].chapters[0].cards.find(
      (c) => c.question === question,
    )!;
    await page
      .getByRole("button", {
        name: new RegExp(card.answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .click();
    await expect(page.locator(".quiz-choice").first()).toBeDisabled();
    await expect(page.getByText("Exactement !")).toBeVisible();
    await page
      .getByRole("button", {
        name:
          i === catalog.subjects[0].chapters[0].cards.length - 1
            ? "Voir mon résultat"
            : "Question suivante",
      })
      .click();
    if (i < catalog.subjects[0].chapters[0].cards.length - 1)
      await expect(page.locator(".session-progress")).toContainText(
        `Question ${i + 2}`,
      );
  }
  await expect(page.locator(".result-numbers")).toContainText("100");
  const result = await page.evaluate(
    () => JSON.parse(localStorage.getItem("memora.progress.v1")!).results[0],
  );
  expect(result.score).toBe(100);
  expect(result.mode).toBe("quiz");
});
test("written exam persists draft and timer, then uses explicit self assessment", async ({
  page,
}) => {
  await page.goto("/#/study/exam/ra-immersif");
  await page
    .getByRole("textbox")
    .last()
    .fill(
      "La RV utilise un monde synthétique. La RA enrichit le réel et la virtualité augmentée ajoute du réel dans un monde virtuel.",
    );
  const deadline = await page.evaluate(
    () => JSON.parse(localStorage.getItem("memora.exam.ra-immersif")!).deadline,
  );
  await page.reload();
  await expect(page.locator(".exam-question textarea")).toContainText(
    "La RV utilise",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("memora.exam.ra-immersif")!).deadline,
    ),
  ).toBe(deadline);
  await page
    .getByRole("button", { name: "Rendre ma copie", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Rendre ma copie" })
    .click();
  await expect(page.locator(".exam-question textarea")).toHaveAttribute(
    "readonly",
    "",
  );
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: "Enregistrer mon résultat" }).click();
  await expect(page.locator(".result-numbers")).toContainText("50");
  const results = await page.evaluate(
    () => JSON.parse(localStorage.getItem("memora.progress.v1")!).results,
  );
  expect(results).toHaveLength(1);
  expect(results[0].score).toBe(50);
});
test("exam expires while closed and cannot add points for blank answers", async ({
  page,
}) => {
  await page.goto("/#/study/exam/ra-systeme");
  await page.evaluate(() => {
    const key = "memora.exam.ra-systeme";
    const draft = JSON.parse(localStorage.getItem(key)!);
    draft.deadline = Date.now() - 1000;
    localStorage.setItem(key, JSON.stringify(draft));
  });
  await page.reload();
  await expect(page.getByText("Copie rendue")).toBeVisible();
  await expect(page.getByRole("checkbox").first()).toBeDisabled();
  await expect(page.locator(".exam-question textarea")).toHaveAttribute(
    "readonly",
    "",
  );
});
test("question and answer mode requires recall, then records self assessment", async ({
  page,
}) => {
  await page.goto("/#/study/qa/ia-fondements");
  await expect(
    page.getByRole("button", { name: "Comparer ma réponse" }),
  ).toBeDisabled();
  await page.locator("#qa-answer").fill("Un système symbolique utilise des règles explicites.");
  await page.getByRole("button", { name: "Comparer ma réponse" }).click();
  await expect(page.locator(".answer-explanation")).toBeVisible();
  await page.getByRole("button", { name: "À retravailler" }).click();
  await expect(page.locator(".session-progress")).toContainText("Question 2");
});
test("import validates a pack before changing the catalog", async ({
  page,
}) => {
  await page.goto("/#/import");
  const input = page.locator("input[type=file]");
  await input.setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"subjects":[]}'),
  });
  await expect(page.getByRole("alert")).toBeVisible();
  const pack = structuredClone(catalog);
  pack.version = catalog.version + 1;
  pack.subjects[0].chapters[0].title = "Un cours actualisé";
  await input.setInputFiles({
    name: "cours.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(pack)),
  });
  await expect(
    page.getByRole("heading", { name: "Ton pack est prêt" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ajouter à ma bibliothèque" }).click();
  await page.goto("/#/learn/ra-immersif");
  await expect(
    page.getByRole("heading", { name: "Un cours actualisé", exact: true }),
  ).toBeVisible();
});
test("mobile navigation, layout and offline reload", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Navigation mobile" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Quiz", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Quiz", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Quiz", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
});
test("screenshots desktop and mobile without overflow or runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/dashboard-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/study/flashcards/ra-immersif");
  await page.screenshot({
    path: "artifacts/flashcards-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});
test("GitHub course update merges a newer catalog and exposes a release", async ({
  page,
}) => {
  const updated = structuredClone(catalog);
  updated.version = catalog.version + 1;
  updated.subjects[0].chapters[0].title = "Cours depuis GitHub";
  await page.route("https://api.github.com/repos/test/memora", (route) =>
    route.fulfill({ json: { default_branch: "main" } }),
  );
  await page.route(
    "https://raw.githubusercontent.com/test/memora/main/public/courses/catalog.json",
    (route) => route.fulfill({ json: updated }),
  );
  await page.route(
    "https://api.github.com/repos/test/memora/releases/latest",
    (route) =>
      route.fulfill({
        json: { tag_name: "v2.1.0", body: "De nouveaux cours.", assets: [] },
      }),
  );
  await page.goto("/#/settings");
  await page.getByRole("textbox", { name: "Dépôt GitHub" }).fill("test/memora");
  await page.getByRole("button", { name: "Mettre les cours à jour" }).click();
  await expect(page.getByRole("status")).toContainText(
    `Catalogue v${catalog.version + 1} installé`,
  );
  await page
    .getByRole("button", { name: "Vérifier la version Android" })
    .click();
  await expect(
    page.getByRole("heading", { name: "La version v2.1.0 est disponible" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ouvrir la release GitHub" }),
  ).toHaveAttribute("href", "https://github.com/test/memora/releases/latest");
  await page.goto("/#/learn/ra-immersif");
  await expect(
    page.getByRole("heading", { name: "Cours depuis GitHub", exact: true }),
  ).toBeVisible();
});
test("restoring a valid backup requires confirmation and survives reload", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await page.getByRole("textbox", { name: "Comment t’appeler ?" }).fill("Lina");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  const backup = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("memora.progress.v1")!),
  );
  backup.name = "Sam";
  backup.read = ["ra-immersif"];
  await page.locator("input[type=file]").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Comment t’appeler ?" }),
  ).toHaveValue("Lina");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Restaurer", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Comment t’appeler ?" }),
  ).toHaveValue("Sam");
});
