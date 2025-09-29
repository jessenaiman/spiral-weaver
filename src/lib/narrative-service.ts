import type { Story, PartySnapshot, EquipmentItem, Chapter, Arc, Moment } from '@/lib/types';
import narrativeData from './data/sample-narrative.json';
import partyData from './data/sample-party.json';
import equipmentData from './data/sample-equipment.json';

// This service simulates the ReferenceShelf by reading directly from JSON files.
export class ReferenceShelf {
  private story: Story;
  private party: PartySnapshot;
  private equipment: EquipmentItem[];

  constructor() {
    this.story = this.processStoryData(narrativeData.stories[0] as any);
    this.party = partyData as PartySnapshot;
    this.equipment = equipmentData as EquipmentItem[];
  }

  // Helper to add chapterId and arcId to each moment for easier lookup and to reconstruct the story object
  private processStoryData(storyData: any): Story {
      const story: Story = {
        id: storyData.storyId,
        title: storyData.title,
        summary: storyData.summary,
        chapters: [],
      };

      story.chapters = storyData.chapters.map((chapterData: any) => {
          const chapter: Chapter = {
              id: chapterData.chapterId,
              name: chapterData.name,
              synopsis: chapterData.synopsis,
              metadata: chapterData.metadata,
              title: chapterData.name,
              storyId: story.id,
              arcs: [],
          };

          chapter.arcs = chapterData.arcs.map((arcData: any) => {
              const arc: Arc = {
                  id: arcData.arcId,
                  label: arcData.label,
                  theme: arcData.theme,
                  title: arcData.label,
                  chapterId: chapter.id,
                  storyId: story.id,
                  moments: [],
              };
              
              arc.moments = arcData.moments.map((momentData: any) => {
                  return {
                      ...momentData,
                      id: momentData.momentId,
                      arcId: arc.id,
                      chapterId: chapter.id,
                      storyId: story.id,
                  };
              });
              return arc;
          });
          return chapter;
      });

      return story;
  }

  async getStories(): Promise<Story[]> {
    return Promise.resolve([this.story]);
  }

  async getStory(storyId: string): Promise<Story | undefined> {
    if (this.story.id === storyId) {
      return Promise.resolve(this.story);
    }
    return Promise.resolve(undefined);
  }

  async getChapter(storyId: string, chapterId: string): Promise<Chapter | undefined> {
    const story = await this.getStory(storyId);
    return Promise.resolve(story?.chapters.find(c => c.id === chapterId));
  }

  async getArc(storyId: string, chapterId: string, arcId: string): Promise<Arc | undefined> {
    const chapter = await this.getChapter(storyId, chapterId);
    return Promise.resolve(chapter?.arcs.find(a => a.id === arcId));
  }

  async getMoment(storyId: string, chapterId: string, arcId: string, momentId: string): Promise<Moment | undefined> {
    const arc = await this.getArc(storyId, chapterId, arcId);
    return Promise.resolve(arc?.moments.find(m => m.id === momentId));
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
