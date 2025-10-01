import { test, expect } from '@playwright/test';

test.describe('Dynamic Scene Content Verification', () => {
  test('should display scene content when moment is selected and generated', async ({ page }) => {
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

        // Wait for the scene to load and verify content appears
        await expect(page.locator('main')).toContainText(/./, { timeout: 10000 });

        // Verify that some scene content is displayed
        const mainContent = page.locator('main');
        const textContent = await mainContent.textContent();
        expect(textContent?.length).toBeGreaterThan(50); // Should have substantial content
      }
    }
  });

  test('should display diagnostics panel when scene is generated', async ({ page }) => {
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

        // Wait for diagnostics to load
        const diagnosticsHeading = page.getByRole('heading', { name: 'Diagnostics' });
        await expect(diagnosticsHeading).toBeVisible({ timeout: 10000 });

        // Verify diagnostics content exists
        const diagnosticsSection = diagnosticsHeading.locator('..');
        await expect(diagnosticsSection).toContainText(/./);
      }
    }
  });

  test('should display UI components correctly when moment is selected', async ({ page }) => {
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

        // Check that personality options are available
        const personalityInputs = page.locator('input[type="radio"], input[type="checkbox"]');
        const personalityCount = await personalityInputs.count();
        expect(personalityCount).toBeGreaterThan(0);
      }
    }
  });

  test('should handle switching between different personality views', async ({ page }) => {
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

        // Find personality options
        const personalityOptions = page.locator('input[type="radio"], input[type="checkbox"]');

        if (await personalityOptions.count() > 1) {
          // Click on different personality options and verify UI updates
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
  test('should switch between personality views', async ({ page }) => {
    await page.goto('/');

    // Navigate to the specific moment
    await page.getByRole('button', { name: 'The Sundered Oak' }).click();
    await page.getByRole('button', { name: 'Whispers in the Wood' }).click();
    await page.getByRole('button', { name: 'The Compass Awakens' }).click();

    // Click the generate button to trigger static scene generation
    await page.getByRole('button', { name: 'Generate Scene' }).click();

    // Wait for the scene to load
    await expect(page.getByRole('heading', { name: 'The Compass Awakens (Static)' })).toBeVisible({ timeout: 10000 });
    
    // Check if personality tabs are available and working
    await expect(page.getByRole('tab', { name: 'Luminari' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Shadow' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Chronicler' })).toBeVisible();
    
    // Click on a different personality tab
    await page.getByRole('tab', { name: 'Shadow' }).click();
    
    // Verify the content switches (would need to check specific shadow-themed content)
    await expect(page.getByRole('tab', { name: 'Shadow' })).toHaveAttribute('data-state', 'active');
  });

  test('should handle restrictions input correctly', async ({ page }) => {
    await page.goto('/');

    // Navigate to the specific moment
    await page.getByRole('button', { name: 'The Sundered Oak' }).click();
    await page.getByRole('button', { name: 'Whispers in the Wood' }).click();
    await page.getByRole('button', { name: 'The Compass Awakens' }).click();

    // Add restrictions
    await page.getByLabel('Content Restrictions').fill('No violence, peaceful resolution');
    
    // Click the generate button
    await page.getByRole('button', { name: 'Generate Scene' }).click();

    // Verify the scene is generated with restrictions applied
    await expect(page.getByRole('heading', { name: 'The Compass Awakens (Static)' })).toBeVisible({ timeout: 10000 });
    
    // Check if the restrictions appear in diagnostics
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
    await expect(page.getByText('No violence, peaceful resolution')).toBeVisible();
  });
});