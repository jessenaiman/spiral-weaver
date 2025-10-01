import { LoreCatalog } from '@/lib/lore-catalog';
import type { Story, Chapter, Arc, Moment } from '@/lib/types';

describe('LoreCatalog', () => {
  let loreCatalog: LoreCatalog;

  beforeEach(() => {
    loreCatalog = new LoreCatalog();
  });

  test('should initialize with sample data', () => {
    const stories = loreCatalog.getStories();
    expect(stories).toBeDefined();
    expect(stories.length).toBeGreaterThan(0);
  });

  test('should get a specific story by ID', () => {
    const stories = loreCatalog.getStories();
    const testStory = stories[0];
    
    if (testStory) {
      const retrievedStory = loreCatalog.getStory(testStory.id);
      expect(retrievedStory).toBeDefined();
      expect(retrievedStory?.id).toBe(testStory.id);
      expect(retrievedStory?.title).toBe(testStory.title);
    }
  });

  test('should return undefined for non-existent story', () => {
    const nonExistentStory = loreCatalog.getStory('non-existent-id');
    expect(nonExistentStory).toBeUndefined();
  });

  test('should get a specific chapter by ID', () => {
    // First get a story to find a chapter ID
    const stories = loreCatalog.getStories();
    if (stories.length > 0 && stories[0].chapters.length > 0) {
      const testChapterId = stories[0].chapters[0].id;
      const chapter = loreCatalog.getChapter(testChapterId);
      expect(chapter).toBeDefined();
      expect(chapter?.id).toBe(testChapterId);
    }
  });

  test('should get a specific arc by ID', () => {
    const stories = loreCatalog.getStories();
    if (stories.length > 0 && stories[0].chapters.length > 0 && stories[0].chapters[0].arcs.length > 0) {
      const testArcId = stories[0].chapters[0].arcs[0].id;
      const arc = loreCatalog.getArc(testArcId);
      expect(arc).toBeDefined();
      expect(arc?.id).toBe(testArcId);
    }
  });

  test('should get a specific moment by ID', () => {
    const stories = loreCatalog.getStories();
    if (stories.length > 0 && 
        stories[0].chapters.length > 0 && 
        stories[0].chapters[0].arcs.length > 0 && 
        stories[0].chapters[0].arcs[0].moments.length > 0) {
      const testMomentId = stories[0].chapters[0].arcs[0].moments[0].id;
      const moment = loreCatalog.getMoment(testMomentId);
      expect(moment).toBeDefined();
      expect(moment?.id).toBe(testMomentId);
    }
  });

  test('should get moment bundle with chapter filter', () => {
    const stories = loreCatalog.getStories();
    if (stories.length > 0 && stories[0].chapters.length > 0) {
      const testChapterId = stories[0].chapters[0].id;
      const moments = loreCatalog.getMomentBundle(testChapterId);
      
      expect(moments).toBeDefined();
      expect(Array.isArray(moments)).toBe(true);
      
      // All moments should belong to the specified chapter
      moments.forEach(moment => {
        expect(moment.chapterId).toBe(testChapterId);
      });
    }
  });

  test('should get moment bundle with no filters (all moments)', () => {
    const allMoments = loreCatalog.getMomentBundle();
    expect(allMoments).toBeDefined();
    expect(Array.isArray(allMoments)).toBe(true);
    expect(allMoments.length).toBeGreaterThan(0);
  });
});