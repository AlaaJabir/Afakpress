import { expect, test } from "@playwright/test";

test.describe("Afakpress Territories", () => {
  test("territories index is reachable without a client-side crash", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto("/territoires");
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("body")).toContainText("Territoires");
    expect(pageErrors).toEqual([]);
  });

  for (const viewport of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    test(`${viewport.name} territory index renders without horizontal overflow`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto("/territoires");
      await expect(page.locator("main")).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
      }));
      expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
      await context.close();
    });
  }

  test("territory admin page requires an authenticated admin", async ({ page }) => {
    await page.goto("/admin/territoires");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("officials and territory upload APIs reject anonymous requests", async ({ request }) => {
    const officials = await request.get("/api/admin/territory-officials");
    expect(officials.status()).toBe(401);

    const upload = await request.post("/api/admin/territory-upload", {
      data: { contentType: "image/webp" },
    });
    expect(upload.status()).toBe(401);

    const links = await request.get("/api/admin/article-territories");
    expect(links.status()).toBe(401);
  });
});
