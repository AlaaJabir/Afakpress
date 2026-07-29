import { expect, test } from "@playwright/test";

const legacyArticleTitles = [
  "Morocco accelerates regional investment plans with new local project desks",
  "Tanger port corridor sees renewed logistics activity ahead of summer peak",
];

test("raw server HTML never contains the legacy demo homepage", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();

  const html = await response.text();
  for (const title of legacyArticleTitles) {
    expect(html).not.toContain(title);
  }
});

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`${viewport.name} direct load and hard refresh hydrate without the legacy homepage`, async ({ browser }) => {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const hydrationErrors: string[] = [];
    const browserErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error" && /hydration|server rendered html/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    for (const title of legacyArticleTitles) {
      await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    }

    await page.reload({ waitUntil: "networkidle" });
    for (const title of legacyArticleTitles) {
      await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    }
    expect(hydrationErrors).toEqual([]);
    expect(browserErrors).toEqual([]);

    await context.close();
  });
}
