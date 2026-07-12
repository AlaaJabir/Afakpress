import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/category/politique",
  "/region/rabat-sale-kenitra",
  "/province/rabat",
  "/commune/rabat",
  "/article/reforme-education-maroc",
];

test.describe("Afakpress public routes", () => {
  for (const route of publicRoutes) {
    test(`renders ${route}`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("body")).not.toContainText("Application error");
    });
  }
});

test("admin login is reachable", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();
});

test("admin dashboard requires authentication", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
