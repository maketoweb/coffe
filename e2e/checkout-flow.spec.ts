import { test, expect } from '@playwright/test';

test.describe('FoodApp - Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('homepage loads with products', async ({ page }) => {
    await expect(page).toHaveTitle(/MarketCoffee|Market Coffee|Delivery/);
    const productCards = page.locator('[data-testid="product-card"], .product-card');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('can navigate to catalog', async ({ page }) => {
    const catalogBtn = page.locator('button, a').filter({ hasText: /catálogo|menu|menú/i }).first();
    if (await catalogBtn.isVisible()) {
      await catalogBtn.click();
      await expect(page.url()).toContain('catalog');
    }
  });

  test('can add product to cart', async ({ page }) => {
    const addButton = page.locator('button').filter({ hasText: /\+/ }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      const cartBadge = page.locator('[data-testid="cart-badge"], .cart-badge');
      await expect(cartBadge).toBeVisible({ timeout: 5000 });
    }
  });

  test('cart shows correct items count', async ({ page }) => {
    const addButton = page.locator('button').filter({ hasText: /\+/ }).first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await addButton.click();
      const badge = page.locator('[data-testid="cart-count"], .cart-count');
      if (await badge.isVisible()) {
        await expect(badge).toContainText('2');
      }
    }
  });
});

test.describe('FoodApp - Navigation', () => {
  test('navigation tabs are visible on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const nav = page.locator('nav, [data-testid="navigation"]');
    await expect(nav).toBeVisible({ timeout: 10000 });
  });
});

test.describe('FoodApp - Store Config', () => {
  test('store name is displayed', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const storeName = page.locator('text=Market Coffee').or(page.locator('text=MarketCoffee'));
    await expect(storeName.first()).toBeVisible({ timeout: 10000 });
  });
});
