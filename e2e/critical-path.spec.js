import { expect, test } from "@playwright/test";

test("storefront catalog and cart critical path", async ({ page }) => {
  await page.goto("/shop");
  await expect(page).toHaveTitle(/Natural Beauty|Skincare/i);
  await expect(page.locator("main")).toBeVisible();
  const productLink = page.locator('a[href^="/product/"]').first();
  if (await productLink.count()) {
    await productLink.click();
    await expect(page.locator("main")).toBeVisible();
    const addButton = page.getByRole("button", { name: /add to bag/i });
    if (await addButton.count()) {
      await addButton.click();
      await page.goto("/cart");
      await expect(page.locator("main")).toContainText(/bag|checkout/i);
    }
  }
});

test("login and signup verification routes are reachable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading")).toBeVisible();
  await page.goto("/register");
  await expect(page.getByRole("heading")).toBeVisible();
  await page.goto("/verify-email?email=customer%40example.com");
  await expect(page.getByRole("heading")).toBeVisible();
});
