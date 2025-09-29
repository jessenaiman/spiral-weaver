
import { test, expect } from '@playwright/test';

test.describe('Dreamweaver Scene Desk', () => {
  test('should generate a static scene when a specific moment is selected', async ({ page }) => {
    await page.goto('/');

    // 1. Check for the main title
    await expect(page.getByRole('heading', { name: 'Dreamweaver Scene Desk' })).toBeVisible();

    // 2. Open the first chapter and arc
    await page.getByRole('button', { name: 'The Sundered Oak' }).click();
    await page.getByRole('button', { name: 'Whispers in the Wood' }).click();

    // 3. Select the specific moment that triggers the static response
    await page.getByRole('button', { name: 'The Compass Awakens' }).click();
    await expect(page.locator('input[name="momentId"][value="m-1-1-1"]')).toBeVisible();

    // 4. Click the generate button
    await page.getByRole('button', { name: 'Generate Scene' }).click();
    
    // 5. Verify the static scene is generated
    // Check for the static title
    await expect(page.getByRole('heading', { name: 'The Compass Awakens (Static)' })).toBeVisible({ timeout: 10000 });
    
    // Check for some static narrative text
    await expect(page.getByText('The crackle of the campfire is the only sound')).toBeVisible();
    
    // Check static diagnostics panel
    await expect(page.getByRole('heading', { name: 'Diagnostics' })).toBeVisible();
    await expect(page.getByText('Initial moment, no restrictions applied.')).toBeVisible();
    await expect(page.getByText('High probability of proceeding to "The First Step".')).toBeVisible();
  });
});
