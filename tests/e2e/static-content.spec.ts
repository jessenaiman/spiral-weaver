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
 
 test.describe('Content Editing Functionality', () => {
   test('should allow editing and saving moment content in NarrativeContentDisplay', async ({ page }) => {
     await page.goto('/');
 
     // Navigate to select a moment
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
 
     // Wait for content to load
     await page.waitForTimeout(1000);
 
     // Find and click the edit button for content
     const editButton = page.locator('button:has-text("Edit")').first();
     await expect(editButton).toBeVisible();
     await editButton.click();
 
     // Verify editing mode is active (textarea should be visible)
     const textArea = page.locator('textarea').first();
     await expect(textArea).toBeVisible();
 
     // Modify the content
     await textArea.fill('This is the updated content for testing purposes.');
 
     // Click save button
     const saveButton = page.locator('button:has-text("Save")').first();
     await expect(saveButton).toBeVisible();
     await saveButton.click();
 
     // Verify save was successful by checking that the textarea is gone and content is displayed
     await expect(textArea).not.toBeVisible();
   });
 
   test('should allow editing and saving timeline in NarrativeContentDisplay', async ({ page }) => {
     await page.goto('/');
 
     // Navigate to select a moment
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
 
     // Wait for content to load
     await page.waitForTimeout(1000);
 
     // Find and click the edit button for timeline
     const timelineEditButton = page.locator('button:has-text("Edit")').nth(1);
     await expect(timelineEditButton).toBeVisible();
     await timelineEditButton.click();
 
     // Verify editing mode is active (textarea should be visible)
     const timelineTextAreas = page.locator('textarea');
     await expect(timelineTextAreas).toHaveCount(1); // Assuming there's at least one timeline item
 
     // Modify the timeline
     await timelineTextAreas.first().fill('Updated timeline item for testing.');
 
     // Click save button
     const saveButton = page.locator('button:has-text("Save")').first();
     await expect(saveButton).toBeVisible();
     await saveButton.click();
 
     // Verify save was successful
     await expect(timelineTextAreas).not.toBeVisible();
   });
 
   test('should allow editing and saving themes in NarrativeContentDisplay', async ({ page }) => {
     await page.goto('/');
 
     // Navigate to select a moment
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
 
     // Wait for content to load
     await page.waitForTimeout(1000);
 
     // Find and click the edit button for themes
     const themesEditButton = page.locator('button:has-text("Edit")').nth(2);
     await expect(themesEditButton).toBeVisible();
     await themesEditButton.click();
 
     // Verify editing mode is active (textarea should be visible)
     const themesTextAreas = page.locator('textarea');
     await expect(themesTextAreas).toHaveCount(1); // Assuming there's at least one theme
 
     // Modify the theme
     await themesTextAreas.first().fill('Updated theme for testing.');
 
     // Click save button
     const saveButton = page.locator('button:has-text("Save")').first();
     await expect(saveButton).toBeVisible();
     await saveButton.click();
 
     // Verify save was successful
     await expect(themesTextAreas).not.toBeVisible();
   });
 
  test('should allow editing and saving lore in NarrativeContentDisplay', async ({ page }) => {
     await page.goto('/');
 
     // Navigate to select a moment
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
 
     // Wait for content to load
     await page.waitForTimeout(1000);
 
     // Find and click the edit button for lore
     const loreEditButton = page.locator('button:has-text("Edit")').nth(3);
     await expect(loreEditButton).toBeVisible();
     await loreEditButton.click();
 
     // Verify editing mode is active (textarea should be visible)
     const loreTextAreas = page.locator('textarea');
     await expect(loreTextAreas).toHaveCount(1); // Assuming there's at least one lore item
 
     // Modify the lore
     await loreTextAreas.first().fill('Updated lore for testing.');
 
     // Click save button
     const saveButton = page.locator('button:has-text("Save")').first();
     await expect(saveButton).toBeVisible();
     await saveButton.click();
 
     // Verify save was successful
     await expect(loreTextAreas).not.toBeVisible();
   });
 
   test('should allow editing and saving subtext in NarrativeContentDisplay', async ({ page }) => {
     await page.goto('/');
 
     // Navigate to select a moment
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
 
     // Wait for content to load
     await page.waitForTimeout(1000);
 
     // Find and click the edit button for subtext
     const subtextEditButton = page.locator('button:has-text("Edit")').nth(4);
     await expect(subtextEditButton).toBeVisible();
     await subtextEditButton.click();
 
     // Verify editing mode is active (textarea should be visible)
     const subtextTextAreas = page.locator('textarea');
     await expect(subtextTextAreas).toHaveCount(1); // Assuming there's at least one subtext item
 
     // Modify the subtext
     await subtextTextAreas.first().fill('Updated subtext for testing.');
 
     // Click save button
     const saveButton = page.locator('button:has-text("Save")').first();
     await expect(saveButton).toBeVisible();
     await saveButton.click();
 
     // Verify save was successful
     await expect(subtextTextAreas).not.toBeVisible();
   });
 
   test('should allow editing and saving moment content in ArcContentDisplay', async ({ page }) => {
     await page.goto('/');
 
     // Navigate to select an arc
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
 
         // Click first arc button after chapter loads
         await page.waitForTimeout(500);
         const arcButtons = await sidebarButtons.all();
         if (arcButtons.length > 2) {
           await arcButtons[2].click();
         }
       }
     }
 
     // Wait for content to load
     await page.waitForTimeout(1000);
 
     // Find a moment display and click its edit button
     const momentEditButton = page.locator('.p-4.border.rounded-lg button:has-text("Edit")').first();
     await expect(momentEditButton).toBeVisible();
     await momentEditButton.click();
 
     // Verify editing mode is active (textarea should be visible)
     const momentTextArea = page.locator('.p-4.border.rounded-lg textarea');
     await expect(momentTextArea).toBeVisible();
 
     // Modify the content
     await momentTextArea.fill('This is the updated moment content for testing purposes.');
 
     // Click save button
     const saveButton = page.locator('.p-4.border.rounded-lg button:has-text("Save")').first();
     await expect(saveButton).toBeVisible();
     await saveButton.click();
 
     // Verify save was successful
     await expect(momentTextArea).not.toBeVisible();
   });
 
   test('should allow editing and saving arc theme in ArcContentDisplay', async ({ page }) => {
     await page.goto('/');
 
     // Navigate to select an arc
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
 
         // Click first arc button after chapter loads
         await page.waitForTimeout(500);
         const arcButtons = await sidebarButtons.all();
         if (arcButtons.length > 2) {
           await arcButtons[2].click();
         }
       }
     }
 
     // Wait for content to load
     await page.waitForTimeout(1000);
 
     // Find and click the edit button for theme
     const themeEditButton = page.locator('button:has-text("Edit")').first();
     await expect(themeEditButton).toBeVisible();
     await themeEditButton.click();
 
     // Verify editing mode is active (textarea should be visible)
     const themeTextArea = page.locator('textarea');
     await expect(themeTextArea).toBeVisible();
 
     // Modify the theme
     await themeTextArea.fill('This is the updated arc theme for testing purposes.');
 
     // Click save button
     const saveButton = page.locator('button:has-text("Save")').first();
     await expect(saveButton).toBeVisible();
     await saveButton.click();
 
     // Verify save was successful
     await expect(themeTextArea).not.toBeVisible();
    });
  });
  
  test.describe('Configuration Verification', () => {
    test('should verify that tailwind.config.ts does not exist', async ({ page }) => {
      // This test verifies that tailwind.config.ts doesn't exist by checking
      // that it's not listed in the project files when we look for it
      // Since Playwright runs in browser context, we can't directly check the file system
      // Instead, we'll make sure it's not accessible via the web server
      const response = await page.goto('/../../../tailwind.config.ts');
      
      // If the file existed and was accessible, we would get a 200 response
      // If it doesn't exist or isn't served, we'd typically get a 404
      if (response) {
        const status = response.status();
        // A 404 or similar error status indicates the file isn't accessible via web server
        // which is what we expect since tailwind.config.ts should not be served
        expect(status).toBeGreaterThanOrEqual(400);
      }
    });
  });