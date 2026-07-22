import { expect, test } from "@playwright/test";

const legacyStorageKey = "afakpress-cms-state-v2";
const migrationKey = "afakpress-cms-storage-migrated-v1";

test("homepage loads when localStorage is full", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.addInitScript(() => {
    const storagePrototype = Object.getPrototypeOf(window.localStorage) as Storage;
    storagePrototype.setItem = () => {
      throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
    };
  });

  await page.goto("/");

  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("This page couldn");
  expect(pageErrors.filter((message) => message.includes("QuotaExceededError"))).toEqual([]);
});

test("legacy oversized CMS state is removed", async ({ page }) => {
  await page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(key, value);
    },
    {
      key: legacyStorageKey,
      value: JSON.stringify({
        articles: [{ content: "legacy article body", featuredImage: "data:image/png;base64,legacy" }],
        media: [{ url: "data:image/png;base64,legacy" }],
        regions: [{ provinces: [{ communes: [{ name: "legacy commune" }] }] }],
      }),
    },
  );

  await page.goto("/");

  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), legacyStorageKey)).toBeNull();
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), migrationKey)).toBe("1");
});

test("CMS content renders without legacy localStorage persistence", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("afakpress-cms-state-v2");
  });

  await page.goto("/");

  await expect(page.getByRole("link", { name: "Afakpress" })).toBeVisible();
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), legacyStorageKey)).toBeNull();
});
