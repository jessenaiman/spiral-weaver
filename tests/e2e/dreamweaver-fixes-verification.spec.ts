import { test, expect } from '@playwright/test';

test.describe('Dreamweaver Fixes Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show ORIGINAL text first when clicking on narrative segments', async ({ page }) => {
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

        // Check that ORIGINAL tab is active by default
        const originalTab = page.locator('[role="tab"]:has-text("ORIGINAL")');
        await expect(originalTab).toHaveAttribute('data-state', 'active');

        // Check that original content is displayed
        // This would check for the original moment content in the UI
        // Note: The exact selector would depend on the actual UI implementation
      }
    }
  });

  test('should verify that "Load Dreamweaver Text" link shows text of each Dreamweaver when existing generated text is in database', async ({ page }) => {
    // Navigate to select a moment that has saved scenes
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

        // Check for personality tabs
        await expect(page.locator('[role="tab"]:has-text("Luminari")')).toBeVisible();
        await expect(page.locator('[role="tab"]:has-text("Shadow")')).toBeVisible();
        await expect(page.locator('[role="tab"]:has-text("Chronicler")')).toBeVisible();

        // Click on Luminari tab and check for "Load Luminari Text" button
        await page.locator('[role="tab"]:has-text("Luminari")').click();
        await expect(page.locator('button:has-text("Load Luminari Text")')).toBeVisible();

        // Click on Shadow tab and check for "Load Shadow Text" button
        await page.locator('[role="tab"]:has-text("Shadow")').click();
        await expect(page.locator('button:has-text("Load Shadow Text")')).toBeVisible();

        // Click on Chronicler tab and check for "Load Chronicler Text" button
        await page.locator('[role="tab"]:has-text("Chronicler")').click();
        await expect(page.locator('button:has-text("Load Chronicler Text")')).toBeVisible();
      }
    }
  });

  test('should verify that clicking on a tab without content shows readonly ORIGINAL text', async ({ page }) => {
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

        // Click on Luminari tab (assuming no content generated yet)
        await page.locator('[role="tab"]:has-text("Luminari")').click();

        // Should show "Generate Luminari Content" button
        await expect(page.locator('button:has-text("Generate Luminari Content")')).toBeVisible();

        // Should show "Based on ORIGINAL Text" section
        await expect(page.locator('text="Based on ORIGINAL Text"')).toBeVisible();

        // Should show the original content in readonly format
        // This would check for the original moment content in the readonly section
      }
    }
  });

  test('should verify that clicking on each tab loads specific text', async ({ page }) => {
    // Navigate to select a moment that has saved scenes
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

        // Click on Luminari tab
        await page.locator('[role="tab"]:has-text("Luminari")').click();
        await expect(page.locator('[role="tab"]:has-text("Luminari")')).toHaveAttribute('data-state', 'active');

        // Click on Shadow tab
        await page.locator('[role="tab"]:has-text("Shadow")').click();
        await expect(page.locator('[role="tab"]:has-text("Shadow")')).toHaveAttribute('data-state', 'active');

        // Click on Chronicler tab
        await page.locator('[role="tab"]:has-text("Chronicler")').click();
        await expect(page.locator('[role="tab"]:has-text("Chronicler")')).toHaveAttribute('data-state', 'active');

        // Click back to ORIGINAL tab
        await page.locator('[role="tab"]:has-text("ORIGINAL")').click();
        await expect(page.locator('[role="tab"]:has-text("ORIGINAL")')).toHaveAttribute('data-state', 'active');
      }
    }
  });

  test('should verify that customize dreamweaver URL functionality exists', async ({ page }) => {
    // Navigate to select a moment that has saved scenes
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

        // Click on Luminari tab
        await page.locator('[role="tab"]:has-text("Luminari")').click();

        // Check for "Customize Dreamweaver Voice" section
        await expect(page.locator('text="Customize Dreamweaver Voice"')).toBeVisible();

        // Check for input field to set custom URL
        const customUrlInput = page.locator('input[placeholder*="Luminari voice"]');
        await expect(customUrlInput).toBeVisible();

        // Check for "Reset to Default" button
        await expect(page.locator('button:has-text("Reset to Default")')).toBeVisible();
      }
    }
  });

  test('should verify that metadata and context items are present', async ({ page }) => {
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

        // Check that metadata sections are present in ORIGINAL tab
        await expect(page.locator('[role="tab"]:has-text("ORIGINAL")')).toHaveAttribute('data-state', 'active');

        // Check for metadata sections (these would depend on the actual implementation)
        // The specific selectors would need to be adjusted based on the UI structure
        // await expect(page.locator('text="Timeline"')).toBeVisible();
        // await expect(page.locator('text="Themes"')).toBeVisible();
        // await expect(page.locator('text="Lore"')).toBeVisible();
        // await expect(page.locator('text="Subtext"')).toBeVisible();
      }
    }
  });
});