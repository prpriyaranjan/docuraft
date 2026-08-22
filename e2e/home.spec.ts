import { test, expect } from '@playwright/test';

test('homepage shows site title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('DocuCraft')).toBeVisible();
});
