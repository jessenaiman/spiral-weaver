import type { Story, PartySnapshot, EquipmentItem, Chapter, Arc, Moment } from '@/lib/types';
import narrativeData from './data/sample-narrative.json';
import partyData from './data/sample-party.json';
import equipmentData from './data/sample-equipment.json';

// This service simulates the ReferenceShelf by reading directly from JSON files.
// It completely replaces the Prisma-based implementation.
export class ReferenceShelf {
  private story: Story;
  private party: PartySnapshot;
  private equipment: EquipmentItem[];

  constructor() {
    this.story = this.processStoryData(narrativeData.stories[0] as Omit<Story, 'chapters'> & { chapters: any[] });
    this.party = partyData as PartySnapshot;
    this.equipment = equipmentData as EquipmentItem[];
  }

  // Helper to add chapterId and arcId to each moment for easier lookup
  private processStoryData(story: Omit<Story, 'chapters'> & { chapters: any[] }): Story {
      const chapters = story.chapters.map(chapter => ({
          ...chapter,
          arcs: chapter.arcs.map((arc: any) => ({
              ...arc,
              moments: arc.moments.map((moment: any) => ({
                  ...moment,
                  chapterId: chapter.chapterId,
                  arcId: arc.arcId,
              })),
          })),
      }));
      return { ...story, chapters } as Story;
  }

  // Simulates LoreCatalog
  async getStories(): Promise<Story[]> {
    return Promise.resolve([this.story]);
  }

  async getStory(storyId: string): Promise<Story | undefined> {
    if (this.story.storyId === storyId) {
      return Promise.resolve(this.story);
    }
    return Promise.resolve(undefined);
  }

  async getChapter(storyId: string, chapterId: string): Promise<Chapter | undefined> {
    const story = await this.getStory(storyId);
    return Promise.resolve(story?.chapters.find(c => c.chapterId === chapterId));
  }

  async getArc(storyId: string, chapterId: string, arcId: string): Promise<Arc | undefined> {
    const chapter = await this.getChapter(storyId, chapterId);
    return Promise.resolve(chapter?.arcs.find(a => a.arcId === arcId));
  }

  async getMoment(storyId: string, chapterId: string, arcId: string, momentId: string): Promise<Moment | undefined> {
    const arc = await this.getArc(storyId, chapterId, arcId);
    return Promise.resolve(arc?.moments.find(m => m.momentId === momentId));
  }

  // Simulates CharacterLedger
  async snapshotParty(): Promise<PartySnapshot> {
    return Promise.resolve(this.party);
  }

  // Simulates EquipmentRegistry
  async listAvailableEquipment(): Promise<EquipmentItem[]> {
    return Promise.resolve(this.equipment);
  }
}
