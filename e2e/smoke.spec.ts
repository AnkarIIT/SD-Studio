import { test, expect } from '@playwright/test';

test('homepage loads shop sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: '3D by SD' }).first()).toBeVisible();
  await expect(page.locator('#catalog')).toBeVisible();
});

test('content page about loads', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: 'About 3D by SD' })).toBeVisible();
});

test('order history loads successfully', async ({ page }) => {
  await page.goto('/about');
  await page.getByRole('button', { name: 'Track Order' }).first().click();
  await expect(page.getByRole('heading', { name: 'Your orders' })).toBeVisible();
  await expect(page.getByText(/No orders yet/i)).toBeVisible();
});