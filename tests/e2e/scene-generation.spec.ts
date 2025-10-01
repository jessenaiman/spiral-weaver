
import { test, expect } from '@playwright/test';

test.describe('Scene Generation and Display', () => {
  test('should generate a scene when a moment is selected', async ({ page }) => {
    await page.goto('/');

    // 1. Check for the main title
    await expect(page.getByRole('heading', { name: 'Dreamweaver Scene Desk' })).toBeVisible();

    // 2. Navigate to select any available moment
    const firstChapterButton = page.locator('[data-sidebar="sidebar"] button').first();
    await firstChapterButton.click();

    const arcButtons = page.locator('[data-sidebar="sidebar"] button').all();
    const arcButton = (await arcButtons)[1];
    if (arcButton) {
      await arcButton.click();

      const momentButtons = page.locator('[data-sidebar="sidebar"] button').all();
      const momentButton = (await momentButtons)[2];
      if (momentButton) {
        await momentButton.click();

        // 3. Click the generate button
        const generateButton = page.getByRole('button', { name: 'Generate Scene' });
        await expect(generateButton).toBeVisible();
        await generateButton.click();

        // 4. Verify a scene is generated
        // Wait for content to appear in main area
        await expect(page.locator('main')).toContainText(/./, { timeout: 10000 });

        // Verify that some scene content is displayed
        const mainContent = page.locator('main');
        const textContent = await mainContent.textContent();
        expect(textContent?.length).toBeGreaterThan(50);
      }
    }
  });

  test('should display diagnostics when scene is generated', async ({ page }) => {
    await page.goto('/');

    // Navigate to select a moment
    const firstChapterButton = page.locator('[data-sidebar="sidebar"] button').first();
    await firstChapterButton.click();

    const arcButtons = page.locator('[data-sidebar="sidebar"] button').all();
    const arcButton = (await arcButtons)[1];
    if (arcButton) {
      await arcButton.click();

      const momentButtons = page.locator('[data-sidebar="sidebar"] button').all();
      const momentButton = (await momentButtons)[2];
      if (momentButton) {
        await momentButton.click();

        // Generate scene
        const generateButton = page.getByRole('button', { name: 'Generate Scene' });
        await generateButton.click();

        // Check for diagnostics panel
        const diagnosticsHeading = page.getByRole('heading', { name: 'Diagnostics' });
        await expect(diagnosticsHeading).toBeVisible({ timeout: 10000 });

        // Verify diagnostics has content
        const diagnosticsSection = diagnosticsHeading.locator('..');
        await expect(diagnosticsSection).toContainText(/./);
      }
    }
  });
});
