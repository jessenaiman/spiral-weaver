import { test, expect } from '@playwright/test';
import { DatabaseLoreCatalog } from '@/lib/database-lore-catalog';
import type { Story, Chapter, Arc, Moment } from '@prisma/client';

test.describe('Database Integration Tests', () => {
  let dbCatalog: DatabaseLoreCatalog;

  test.beforeEach(async () => {
    dbCatalog = new DatabaseLoreCatalog();
  });

  test.afterEach(async () => {
    await dbCatalog.disconnect();
  });

  test('should load data from the prisma sqlite db', async () => {
    const stories = await dbCatalog.getStories();
    expect(stories).toBeDefined();
    expect(stories.length).toBeGreaterThan(0);
  });

  test('should load chapters', async () => {
    const stories = await dbCatalog.getStories() as (Story & { chapters: (Chapter & { arcs: (Arc & { moments: Moment[] })[] })[] })[];
    const story = stories[0];
    expect(story.chapters).toBeDefined();
    expect(story.chapters.length).toBeGreaterThan(0);
  });

  test('should load arcs under chapters', async () => {
    const stories = await dbCatalog.getStories() as (Story & { chapters: (Chapter & { arcs: (Arc & { moments: Moment[] })[] })[] })[];
    const chapter = stories[0].chapters[0];
    expect(chapter.arcs).toBeDefined();
    expect(chapter.arcs.length).toBeGreaterThan(0);

    // Verify arc belongs to chapter
    chapter.arcs.forEach((arc: Arc & { moments: Moment[] }) => {
      expect(arc.chapterId).toBe(chapter.id);
    });
  });

  test('should load moments connected to arcs', async () => {
    const stories = await dbCatalog.getStories() as (Story & { chapters: (Chapter & { arcs: (Arc & { moments: Moment[] })[] })[] })[];
    const arc = stories[0].chapters[0].arcs[0];
    expect(arc.moments).toBeDefined();
    expect(arc.moments.length).toBeGreaterThan(0);

    // Verify moments belong to arc
    arc.moments.forEach((moment: Moment) => {
      expect(moment.arcId).toBe(arc.id);
    });
  });

  test('should be able to query specific story', async () => {
    const story = await dbCatalog.getStory('omega-spiral-01');
    expect(story).toBeDefined();
    expect(story?.title).toBe('Omega Spiral');
  });

  test('should be able to query specific chapter', async () => {
    const chapter = await dbCatalog.getChapter('omega-spiral-01', 'ch-os-01');
    expect(chapter).toBeDefined();
    expect(chapter?.name).toBe('The Forging and The Fall');
  });

  test('should be able to query specific arc', async () => {
    const arc = await dbCatalog.getArc('omega-spiral-01', 'ch-os-01', 'arc-os-1-1');
    expect(arc).toBeDefined();
    expect(arc?.label).toBe('Genesis of Power');
  });

  test('should be able to query specific moment', async () => {
    const moment = await dbCatalog.getMoment('omega-spiral-01', 'ch-os-01', 'arc-os-1-1', 'm-os-1');
    expect(moment).toBeDefined();
    expect(moment?.title).toBe('The Ancient Call');
  });

  test('should be able to save changes to a story', async () => {
    const originalStory = await dbCatalog.getStory('omega-spiral-01');
    expect(originalStory).toBeDefined();

    const updatedSummary = 'Updated summary for testing';
    await dbCatalog.saveStory({
      storyId: 'omega-spiral-01',
      title: originalStory!.title,
      summary: updatedSummary,
    });

    const updatedStory = await dbCatalog.getStory('omega-spiral-01');
    expect(updatedStory?.summary).toBe(updatedSummary);
  });

  test('should be able to save changes to a chapter', async () => {
    const originalChapter = await dbCatalog.getChapter('omega-spiral-01', 'ch-os-01');
    expect(originalChapter).toBeDefined();

    const updatedSynopsis = 'Updated synopsis for testing';
    await dbCatalog.saveChapter('omega-spiral-01', {
      chapterId: 'ch-os-01',
      name: originalChapter!.name,
      synopsis: updatedSynopsis,
    });

    const updatedChapter = await dbCatalog.getChapter('omega-spiral-01', 'ch-os-01');
    expect(updatedChapter?.synopsis).toBe(updatedSynopsis);
  });

  test('should be able to save changes to an arc', async () => {
    const originalArc = await dbCatalog.getArc('omega-spiral-01', 'ch-os-01', 'arc-os-1-1');
    expect(originalArc).toBeDefined();

    const updatedTheme = 'Updated theme for testing';
    await dbCatalog.saveArc('ch-os-01', {
      arcId: 'arc-os-1-1',
      label: originalArc!.label,
      theme: updatedTheme,
    });

    const updatedArc = await dbCatalog.getArc('omega-spiral-01', 'ch-os-01', 'arc-os-1-1');
    expect(updatedArc?.theme).toBe(updatedTheme);
  });

  test('should be able to save changes to a moment', async () => {
    const originalMoment = await dbCatalog.getMoment('omega-spiral-01', 'ch-os-01', 'arc-os-1-1', 'm-os-1');
    expect(originalMoment).toBeDefined();

    const updatedContent = 'Updated content for testing';
    await dbCatalog.saveMoment('arc-os-1-1', {
      ...originalMoment!,
      content: updatedContent,
    });

    const updatedMoment = await dbCatalog.getMoment('omega-spiral-01', 'ch-os-01', 'arc-os-1-1', 'm-os-1');
    expect(updatedMoment?.content).toBe(updatedContent);
  });
});