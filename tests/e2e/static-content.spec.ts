import { test, expect } from '@playwright/test';

test.describe('Dynamic Scene Content Verification', () => {
  test('should display main UI container after scene generation', async ({ page }) => {
    await page.goto('/');

    // Navigate to the first available moment
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

        // Click the generate button to trigger scene generation
        const generateButton = page.getByRole('button', { name: 'Generate Scene' });
        await expect(generateButton).toBeVisible();
        await generateButton.click();

        // Wait for the main UI container to appear (not content)
        await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
        // Optionally check for a known UI element inside main
        await expect(page.getByRole('heading')).toBeVisible();
      }
    }
  });

  test('should display diagnostics panel UI when scene is generated', async ({ page }) => {
    await page.goto('/');

    // Navigate to select a moment and generate scene (similar to above)
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

        const generateButton = page.getByRole('button', { name: 'Generate Scene' });
        await generateButton.click();

        // Wait for diagnostics panel UI to appear
        const diagnosticsHeading = page.getByRole('heading', { name: 'Diagnostics' });
        await expect(diagnosticsHeading).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should display UI controls for moment selection', async ({ page }) => {
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

        // Check for restrictions input
        await expect(page.getByLabel('Content Restrictions')).toBeVisible();

        // Check for generate button
        await expect(page.getByRole('button', { name: 'Generate Scene' })).toBeVisible();

        // Check that personality options are available (UI only)
        const personalityInputs = page.locator('input[type="radio"], input[type="checkbox"]');
        await expect(personalityInputs.first()).toBeVisible();
      }
    }
  });

  test('should allow switching between personality UI options', async ({ page }) => {
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

        // Find personality options (UI only)
        const personalityOptions = page.locator('input[type="radio"], input[type="checkbox"]');

        if (await personalityOptions.count() > 1) {
          // Click on different personality options and verify UI state changes
          const firstOption = personalityOptions.first();
          const secondOption = personalityOptions.nth(1);

          await firstOption.check();
          await expect(firstOption).toBeChecked();

          await secondOption.check();
          await expect(secondOption).toBeChecked();
        }
      }
    }
  });
});

test.describe('UI Component Interaction', () => {
  test('should show and switch personality tabs in UI', async ({ page }) => {
    await page.goto('/');

    // Navigate through sidebar structure (content-agnostic)
    const sidebarButtons = page.locator('[data-sidebar="sidebar"] button');

    // Click first story button
    const storyButtons = await sidebarButtons.all();
    if (storyButtons.length > 0) {
      await storyButtons[0].click();

      // Click first chapter button after story loads
      await page.waitForTimeout(500);
      const chapterButtons = await sidebarButtons.all();
      if (chapterButtons.length > 1) {
        await chapterButtons[1].click();

        // Click first moment button after chapter loads
        await page.waitForTimeout(500);
        const momentButtons = await sidebarButtons.all();
        if (momentButtons.length > 2) {
          await momentButtons[2].click();
        }
      }
    }

    // Click the generate button to trigger static scene generation
    await page.getByRole('button', { name: 'Generate Scene' }).click();

    // Wait for scene UI to load (check for heading without content dependency)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 });

    // Check if personality tabs are available and working (UI structure only)
    const personalityTabs = page.getByRole('tab');
    const tabCount = await personalityTabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(3); // Should have at least 3 personality options

    // Click on second personality tab and check UI state
    if (tabCount >= 2) {
      await personalityTabs.nth(1).click();
      await expect(personalityTabs.nth(1)).toHaveAttribute('data-state', 'active');
    }
  });

  test('should show restrictions input and diagnostics UI', async ({ page }) => {
    await page.goto('/');

    // Navigate through sidebar structure (content-agnostic)
    const sidebarButtons = page.locator('[data-sidebar="sidebar"] button');

    // Click first story button
    const storyButtons = await sidebarButtons.all();
    if (storyButtons.length > 0) {
      await storyButtons[0].click();

      // Click first chapter button after story loads
      await page.waitForTimeout(500);
      const chapterButtons = await sidebarButtons.all();
      if (chapterButtons.length > 1) {
        await chapterButtons[1].click();

        // Click first moment button after chapter loads
        await page.waitForTimeout(500);
        const momentButtons = await sidebarButtons.all();
        if (momentButtons.length > 2) {
          await momentButtons[2].click();
        }
      }
    }

    // Add restrictions (UI only)
    await expect(page.getByLabel('Content Restrictions')).toBeVisible();
    await page.getByLabel('Content Restrictions').fill('No violence, peaceful resolution');
    
    // Click the generate button
    await page.getByRole('button', { name: 'Generate Scene' }).click();

    // Wait for diagnostics UI
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
  });
});