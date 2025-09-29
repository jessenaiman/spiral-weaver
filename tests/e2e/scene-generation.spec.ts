
import { test, expect } from '@playwright/test';

test.describe('Dreamweaver Scene Desk', () => {
  test('should generate a scene when a moment is selected', async ({ page }) => {
    await page.goto('/');

    // 1. Check for the main title
    await expect(page.getByRole('heading', { name: 'Dreamweaver Scene Desk' })).toBeVisible();

    // 2. Open the first chapter and arc
    await page.getByRole('button', { name: 'The Sundered Oak' }).click();
    await page.getByRole('button', { name: 'Whispers in the Wood' }).click();

    // 3. Select a moment
    await page.getByRole('button', { name: 'The Compass Awakens' }).click();
    await expect(page.locator('input[name="momentId"][value="m-1-1-1"]')).toBeVisible();

    // 4. Click the generate button
    await page.getByRole('button', { name: 'Generate Scene' }).click();
    
    // 5. Wait for and verify the loading state
    await expect(page.getByText('Weaving the narrative...')).toBeVisible();

    // 6. Verify the scene is generated
    // Wait for the scene title to appear, giving it a longer timeout for GenAI
    await expect(page.getByText('The Compass Awakens')).toBeVisible({ timeout: 20000 });
    
    // Check for some narrative text
    await expect(page.locator('.prose')).not.toBeEmpty();
    
    // Check diagnostics panel
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
    await expect(page.getByText('No restrictions applied.')).toBeVisible();
  });
});
