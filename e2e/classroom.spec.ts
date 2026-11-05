import { test, expect } from "@playwright/test";
test("AI advice is opt-in and only changes the assessment after explicit application", async ({
  page,
}) => {
  await page.route("**/api/exam/feedback", (route) =>
    route.fulfill({
      json: {
        model: "test/free",
        summary: "Vérifie le rôle de chaque équipement.",
        criteria: Array.from({ length: 4 }, (_, i) => ({
          met: i < 2,
          feedback: i < 2 ? "Notion retrouvée." : "À préciser.",
        })),
      },
    }),
  );
  await page.goto("/#/study/exam/c1-reseaux");
  await page
    .locator(".exam-question textarea")
    .fill(
      "Le routeur choisit une route et le switch commute les trames locales.",
    );
  await page
    .getByRole("button", { name: "Rendre ma copie", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Rendre ma copie" })
    .click();
  await page
    .getByRole("button", { name: "Demander un avis IA gratuit" })
    .click();
  await expect(page.locator(".ai-feedback")).toContainText("2/4");
  await expect(page.getByRole("checkbox").first()).not.toBeChecked();
  await page
    .getByRole("button", { name: "Reporter ces suggestions dans ma grille" })
    .click();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.getByRole("checkbox").first().uncheck();
  await page.getByRole("button", { name: "Enregistrer mon résultat" }).click();
  await expect(page.locator(".result-numbers")).toContainText("25");
});
test("two devices join via a player QR, play ten rounds, reconnect and see real scores", async ({
  browser,
}) => {
  test.setTimeout(180000);
  const hostContext = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1440, height: 1000 },
  });
  const guestContext = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 390, height: 844 },
  });
  const host = await hostContext.newPage(),
    guest = await guestContext.newPage();
  try {
    for (const [page, name] of [
      [host, "Nora"],
      [guest, "Sami"],
    ] as const) {
      await page.goto("/#/classroom");
      await page.getByLabel("Ton pseudo").fill(name);
      await page
        .getByRole("button", { name: "Créer mon profil et mon QR" })
        .click();
      await expect(page.locator(".personal-qr")).toBeVisible();
    }
    const qr = await guest.locator(".personal-qr").screenshot();
    await host.getByLabel("Terrain de jeu").selectOption("c1-ipv4");
    await host.getByRole("button", { name: /Dés du savoir/ }).click();
    await host.getByRole("button", { name: "Créer une salle" }).click();
    await host.getByRole("button", { name: "Scanner un joueur" }).click();
    await host
      .locator('input[type="file"]')
      .setInputFiles({ name: "player.png", mimeType: "image/png", buffer: qr });
    await guest.getByRole("button", { name: "Rejoindre", exact: true }).click();
    await expect(host.locator(".lobby-players")).toContainText("Sami");
    await host.getByRole("button", { name: "Lancer les 10 manches" }).click();
    await guest.reload();
    await expect(guest.locator(".room-toolbar")).toContainText("MANCHE 1");
    for (let round = 0; round < 10; round++) {
      const lead = round % 2 === 0 ? host : guest,
        other = round % 2 === 0 ? guest : host;
      await expect(lead.locator(".private-answer")).toBeVisible();
      await expect(other.locator(".private-answer")).toHaveCount(0);
      await lead
        .getByRole("button", { name: "Ouvrir les 45 secondes" })
        .click();
      await other
        .getByLabel("Ta réponse rapide")
        .fill("Mon raisonnement expliqué avec mes mots.");
      await other.getByRole("button", { name: "Envoyer ma réponse" }).click();
      await lead
        .getByRole("button", { name: "Bonne idée", exact: true })
        .click();
      await lead
        .getByRole("button", { name: "Révéler le corrigé et les points" })
        .click();
      await expect(other.locator(".private-answer")).toBeVisible();
      await host
        .getByRole("button", {
          name: round === 9 ? "Voir le classement final" : "Manche suivante",
          exact: true,
        })
        .click();
    }
    await expect(host.locator(".final-podium")).toBeVisible();
    await expect(guest.locator(".final-podium")).toBeVisible();
    await expect(host.locator(".final-podium .scoreboard li")).toHaveCount(2);
    await host.screenshot({
      path: "artifacts/classroom-results-desktop.png",
      fullPage: true,
    });
    expect(
      await guest.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await guest.getByRole("button", { name: "Nouvelle partie" }).click();
    await guest.screenshot({
      path: "artifacts/classroom-mobile.png",
      fullPage: true,
    });
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});
test("portrait flashcard flips both ways with reduced motion and retains subject identity", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/study/flashcards/fx-binding");
  const card = page.locator(".study-card.flashcards");
  const bounds = await card.boundingBox();
  expect(bounds!.height).toBeGreaterThan(bounds!.width);
  await expect(card.locator(".subject-monogram")).toHaveText("FX");
  await page
    .getByRole("button", { name: "Retourner la carte", exact: true })
    .click();
  await expect(card).toHaveClass(/revealed/);
  await expect(card.locator(".flip-face.back")).toHaveAttribute(
    "aria-hidden",
    "false",
  );
  await page
    .getByRole("button", { name: "Revoir la question", exact: true })
    .click();
  await expect(card).not.toHaveClass(/revealed/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
