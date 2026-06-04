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

test('admin login page loads', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: '3D by SD Admin' })).toBeVisible();
});

test('order history shows OTP gate before verify', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Track Order' }).first().click();
  await expect(page.getByText(/Verify email to load orders from server/i)).toBeVisible();
});