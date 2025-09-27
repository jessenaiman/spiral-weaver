import { Story, PartySnapshot, EquipmentItem, Chapter, Arc, Moment } from '@/lib/types';
import narrativeData from './data/sample-narrative.json';
import partyData from './data/sample-party.json';
import equipmentData from './data/sample-equipment.json';

// This service simulates the ReferenceShelf, LoreCatalog, CharacterLedger, and EquipmentRegistry
export class ReferenceShelf {
  private stories: Story[];
  private party: PartySnapshot;
  private equipment: EquipmentItem[];

  constructor() {
    this.stories = narrativeData.stories as Story[];
    this.party = partyData as PartySnapshot;
    this.equipment = equipmentData as EquipmentItem[];
  }

  // Simulates LoreCatalog
  async getStories(): Promise<Story[]> {
    return Promise.resolve(this.stories);
  }

  async getStory(storyId: string): Promise<Story | undefined> {
    return Promise.resolve(this.stories.find(s => s.storyId === storyId));
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
