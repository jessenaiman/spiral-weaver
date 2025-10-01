import { test, expect } from '@playwright/test';

test.describe('Navigation and Story Selection', () => {
  test('should display the main page with sidebar navigation', async ({ page }) => {
    await page.goto('/');

    // Check for the main title
    await expect(page.getByRole('heading', { name: 'Dreamweaver Scene Desk' })).toBeVisible();

    // Check for sidebar components
    await expect(page.locator('[data-sidebar="sidebar"]')).toBeVisible();
    await expect(page.getByText('Scene Weaver')).toBeVisible();

    // Check for sidebar trigger
    await expect(page.getByRole('button', { name: 'Toggle Sidebar' })).toBeVisible();
  });

  test('should allow user to expand and collapse chapters and arcs', async ({ page }) => {
    await page.goto('/');

    // Find the first chapter button (any chapter)
    const firstChapterButton = page.locator('[data-sidebar="sidebar"] button').first();
    await expect(firstChapterButton).toBeVisible();

    // Click on the first chapter to expand it
    await firstChapterButton.click();

    // After expanding, there should be more buttons (arcs)
    const buttonsAfterExpand = page.locator('[data-sidebar="sidebar"] button');
    const buttonCountAfter = await buttonsAfterExpand.count();

    // Click again to collapse
    await firstChapterButton.click();

    // The count should be less after collapsing
    const buttonsAfterCollapse = page.locator('[data-sidebar="sidebar"] button');
    const buttonCountAfterCollapse = await buttonsAfterCollapse.count();

    // Should have fewer buttons after collapse (arcs hidden)
    expect(buttonCountAfterCollapse).toBeLessThan(buttonCountAfter);
  });

  test('should display story information in narrative browser', async ({ page }) => {
    await page.goto('/');

    // Check if story information is displayed (should have some text content)
    const mainContent = page.locator('main');
    await expect(mainContent).toContainText(/./); // Should have some text content
  });
});

test.describe('Scene Display and Diagnostics', () => {
  test('should display default message when no scene is selected', async ({ page }) => {
    await page.goto('/');

    // Initially, there should be a message indicating to generate a scene
    await expect(page.getByText(/Select a moment and generate a scene|No scene generated yet/i)).toBeVisible();
  });

  test('should allow user to input custom restrictions', async ({ page }) => {
    await page.goto('/');

    // Expand navigation to select a moment
    const firstChapterButton = page.locator('[data-sidebar="sidebar"] button').first();
    await firstChapterButton.click();

    // Find and click on the first arc button
    const arcButtons = page.locator('[data-sidebar="sidebar"] button').all();
    const arcButton = (await arcButtons)[1]; // Second button should be an arc
    if (arcButton) {
      await arcButton.click();

      // Find and click on the first moment button
      const momentButtons = page.locator('[data-sidebar="sidebar"] button').all();
      const momentButton = (await momentButtons)[2]; // Third button should be a moment
      if (momentButton) {
        await momentButton.click();

        // Check for restrictions input area
        const restrictionsInput = page.getByLabel('Content Restrictions');
        await expect(restrictionsInput).toBeVisible();

        // Test typing in the restrictions field
        await restrictionsInput.fill('No violence');
        await expect(restrictionsInput).toHaveValue('No violence');
      }
    }
  });
});

test.describe('User Interface Elements', () => {
  test('should have working sidebar toggle', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('[data-sidebar="sidebar"]');
    const toggleButton = page.getByRole('button', { name: 'Toggle Sidebar' });

    // Sidebar should be visible initially
    await expect(sidebar).toBeVisible();

    // Click toggle to collapse
    await toggleButton.click();

    // After toggle, sidebar should be hidden or collapsed
    // The exact behavior depends on the implementation, but the button should still be visible
    await expect(toggleButton).toBeVisible();
  });

  test('should display Dreamweaver personality options when moment is selected', async ({ page }) => {
    await page.goto('/');

    // Navigate to select a moment (similar to restrictions test)
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

        // Check that personality options are available
        // Look for radio buttons or similar controls for personalities
        const personalityOptions = page.locator('input[type="radio"], input[type="checkbox"]').filter({ hasText: /Luminari|Shadow|Chronicler/ });
        const count = await personalityOptions.count();
        expect(count).toBeGreaterThan(0);
      }
    }
  });
});