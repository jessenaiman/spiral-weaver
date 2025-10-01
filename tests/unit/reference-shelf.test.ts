import { ReferenceShelf } from '@/lib/narrative-service';
import type { Story, Moment, Chapter, Arc } from '@/lib/types';

describe('ReferenceShelf', () => {
  let referenceShelf: ReferenceShelf;

  beforeEach(() => {
    referenceShelf = new ReferenceShelf();
  });

  test('should initialize with lore catalog, character ledger, and equipment registry', async () => {
    const stories = await referenceShelf.getStories();
    expect(stories).toBeDefined();
    expect(Array.isArray(stories)).toBe(true);
    expect(stories.length).toBeGreaterThan(0);
  });

  test('should get a specific story by ID', async () => {
    const stories = await referenceShelf.getStories();
    if (stories.length > 0) {
      const testStory = stories[0];
      const retrievedStory = await referenceShelf.getStory(testStory.id);
      
      expect(retrievedStory).toBeDefined();
      expect(retrievedStory?.id).toBe(testStory.id);
      expect(retrievedStory?.title).toBe(testStory.title);
    }
  });

  test('should return undefined for non-existent story', async () => {
    const nonExistentStory = await referenceShelf.getStory('non-existent-id');
    expect(nonExistentStory).toBeUndefined();
  });

  test('should get a specific chapter within a story', async () => {
    const stories = await referenceShelf.getStories();
    if (stories.length > 0 && stories[0].chapters.length > 0) {
      const testStory = stories[0];
      const testChapter = testStory.chapters[0];
      
      const retrievedChapter = await referenceShelf.getChapter(testStory.id, testChapter.id);
      expect(retrievedChapter).toBeDefined();
      expect(retrievedChapter?.id).toBe(testChapter.id);
      expect(retrievedChapter?.storyId).toBe(testStory.id);
    }
  });

  test('should return undefined for chapter in wrong story', async () => {
    const stories = await referenceShelf.getStories();
    if (stories.length > 1 && stories[0].chapters.length > 0) {
      const wrongStoryId = stories[1].id; // Different story
      const testChapter = stories[0].chapters[0]; // From first story
      
      const retrievedChapter = await referenceShelf.getChapter(wrongStoryId, testChapter.id);
      expect(retrievedChapter).toBeUndefined();
    }
  });

  test('should get a specific arc within a story and chapter', async () => {
    const stories = await referenceShelf.getStories();
    if (stories.length > 0 && 
        stories[0].chapters.length > 0 && 
        stories[0].chapters[0].arcs.length > 0) {
      
      const testStory = stories[0];
      const testChapter = testStory.chapters[0];
      const testArc = testChapter.arcs[0];
      
      const retrievedArc = await referenceShelf.getArc(testStory.id, testChapter.id, testArc.id);
      expect(retrievedArc).toBeDefined();
      expect(retrievedArc?.id).toBe(testArc.id);
      expect(retrievedArc?.storyId).toBe(testStory.id);
      expect(retrievedArc?.chapterId).toBe(testChapter.id);
    }
  });

  test('should get a specific moment within a story, chapter, and arc', async () => {
    const stories = await referenceShelf.getStories();
    if (stories.length > 0 && 
        stories[0].chapters.length > 0 && 
        stories[0].chapters[0].arcs.length > 0 && 
        stories[0].chapters[0].arcs[0].moments.length > 0) {
      
      const testStory = stories[0];
      const testChapter = testStory.chapters[0];
      const testArc = testChapter.arcs[0];
      const testMoment = testArc.moments[0];
      
      const retrievedMoment = await referenceShelf.getMoment(
        testStory.id, 
        testChapter.id, 
        testArc.id, 
        testMoment.id
      );
      
      expect(retrievedMoment).toBeDefined();
      expect(retrievedMoment?.id).toBe(testMoment.id);
      expect(retrievedMoment?.storyId).toBe(testStory.id);
      expect(retrievedMoment?.chapterId).toBe(testChapter.id);
      expect(retrievedMoment?.arcId).toBe(testArc.id);
    }
  });

  test('should get party snapshot', async () => {
    const partySnapshot = await referenceShelf.snapshotParty();
    expect(partySnapshot).toBeDefined();
    expect(partySnapshot.members).toBeDefined();
    expect(Array.isArray(partySnapshot.members)).toBe(true);
  });

  test('should get available equipment', async () => {
    const equipment = await referenceShelf.listAvailableEquipment();
    expect(equipment).toBeDefined();
    expect(Array.isArray(equipment)).toBe(true);
  });

  test('should get moment bundle', async () => {
    const moments = await referenceShelf.getMomentBundle();
    expect(moments).toBeDefined();
    expect(Array.isArray(moments)).toBe(true);
  });
});