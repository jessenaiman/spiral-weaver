
import { test, expect } from '@playwright/test';

test.describe('Spiral Weaver Application', () => {
  test('should generate an enhanced scene with AI agent improvements', async ({ page }) => {
    await page.goto('/');

    // 1. Check for the main title
    await expect(page.getByRole('heading', { name: 'Spiral Weaver' })).toBeVisible();

    // 2. Open the first chapter and arc
    await page.getByRole('button', { name: 'The Sundered Oak' }).click();
    await page.getByRole('button', { name: 'Whispers in the Wood' }).click();

    // 3. Select the specific moment that triggers scene generation
    await page.getByRole('button', { name: 'The Compass Awakens' }).click();
    await expect(page.locator('input[name="momentId"][value="m-1-1-1"]')).toBeVisible();

    // 4. Click the generate button
    await page.getByRole('button', { name: 'Generate Scene' }).click();

    // 5. Verify the enhanced scene is generated with AI improvements
    await expect(page.getByRole('heading', { name: 'The Compass Awakens' })).toBeVisible({ timeout: 15000 });

    // Check for narrative text
    await expect(page.getByText('The crackle of the campfire is the only sound')).toBeVisible();

    // 6. Verify AI agent enhancements are displayed in diagnostics
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
    await expect(page.getByText('Initial moment, no restrictions applied.')).toBeVisible();

    // Check for AI agent quality enhancements
    await expect(page.getByText('AI Agent Enhancements')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Quality Score')).toBeVisible();
  });

  test('should display testing dashboard with bug squashing game metrics', async ({ page }) => {
    await page.goto('/');

    // Navigate to testing dashboard
    await page.getByRole('tab', { name: 'Bug Squashing Game' }).click();

    // Verify testing dashboard loads
    await expect(page.getByRole('heading', { name: 'Bug Squashing Game Dashboard' })).toBeVisible();

    // Check for key metrics
    await expect(page.getByText('Active Bugs')).toBeVisible();
    await expect(page.getByText('Coverage Gaps')).toBeVisible();
    await expect(page.getByText('Quality Score')).toBeVisible();

    // Verify bug count and coverage gap counts are displayed
    await expect(page.locator('text=/\\d+/').first()).toBeVisible();

    // Test the Run Analysis button
    await page.getByRole('button', { name: 'Run Analysis' }).click();
    await expect(page.getByText('Analyzing...')).toBeVisible();

    // Wait for analysis to complete
    await expect(page.getByRole('button', { name: 'Run Analysis' })).toBeVisible({ timeout: 10000 });
  });

  test('should display recent bugs and coverage gaps in testing dashboard', async ({ page }) => {
    await page.goto('/');

    // Navigate to testing dashboard
    await page.getByRole('tab', { name: 'Bug Squashing Game' }).click();

    // Check for recent bugs section
    await expect(page.getByRole('heading', { name: /Recent Bugs/ })).toBeVisible();

    // Check for coverage gaps section
    await expect(page.getByRole('heading', { name: /Coverage Gaps/ })).toBeVisible();

    // Verify bug cards show severity badges and descriptions
    const bugCards = page.locator('[class*="border rounded-lg"]').first();
    if (await bugCards.isVisible()) {
      await expect(bugCards.locator('text=/critical|high|medium|low/')).toBeVisible();
    }
  });

  test('should show quality metrics breakdown', async ({ page }) => {
    await page.goto('/');

    // Navigate to testing dashboard
    await page.getByRole('tab', { name: 'Bug Squashing Game' }).click();

    // Check for quality metrics section
    await expect(page.getByRole('heading', { name: 'Quality Metrics' })).toBeVisible();

    // Verify quality categories are displayed
    await expect(page.getByText('Narrative Consistency')).toBeVisible();
    await expect(page.getByText('Technical Accuracy')).toBeVisible();
    await expect(page.getByText('User Experience')).toBeVisible();
    await expect(page.getByText('Performance')).toBeVisible();

    // Check for percentage scores
    await expect(page.locator('text=/\\d+%/').first()).toBeVisible();
  });

  test('should display AI recommendations in testing dashboard', async ({ page }) => {
    await page.goto('/');

    // Navigate to testing dashboard
    await page.getByRole('tab', { name: 'Bug Squashing Game' }).click();

    // Check for AI recommendations section
    await expect(page.getByRole('heading', { name: 'AI Recommendations' })).toBeVisible();

    // Verify recommendations are displayed as a list
    await expect(page.locator('ul li').first()).toBeVisible();
  });

  test('should allow switching between Scene Weaver and Testing Dashboard tabs', async ({ page }) => {
    await page.goto('/');

    // Verify Scene Weaver tab is active by default
    await expect(page.getByRole('tab', { name: 'Scene Weaver' })).toHaveAttribute('data-state', 'active');

    // Switch to testing dashboard
    await page.getByRole('tab', { name: 'Bug Squashing Game' }).click();
    await expect(page.getByRole('tab', { name: 'Bug Squashing Game' })).toHaveAttribute('data-state', 'active');

    // Switch back to Scene Weaver
    await page.getByRole('tab', { name: 'Scene Weaver' }).click();
    await expect(page.getByRole('tab', { name: 'Scene Weaver' })).toHaveAttribute('data-state', 'active');

    // Verify main content changes based on active tab
    await expect(page.getByRole('heading', { name: 'Spiral Weaver' })).toBeVisible();
  });

  test('should handle scene generation workflow with enhanced AI features', async ({ page }) => {
    await page.goto('/');

    // Generate a scene first
    await page.getByRole('button', { name: 'The Sundered Oak' }).click();
    await page.getByRole('button', { name: 'Whispers in the Wood' }).click();
    await page.getByRole('button', { name: 'The Compass Awakens' }).click();

    // Wait for form to be ready
    await expect(page.locator('input[name="momentId"][value="m-1-1-1"]')).toBeVisible();

    // Generate the scene
    await page.getByRole('button', { name: 'Generate Scene' }).click();

    // Verify scene displays with AI enhancements
    await expect(page.getByText('The Compass Awakens')).toBeVisible({ timeout: 15000 });

    // Switch to testing dashboard to verify it shows updated metrics
    await page.getByRole('tab', { name: 'Bug Squashing Game' }).click();

    // Verify dashboard shows current state
    await expect(page.getByRole('heading', { name: 'Bug Squashing Game Dashboard' })).toBeVisible();
    await expect(page.getByText('Active Bugs')).toBeVisible();
  });
});
