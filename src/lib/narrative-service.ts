import type { Story, PartySnapshot, EquipmentItem, Chapter, Arc, Moment, SceneDescriptor } from '@/lib/types';
import { LoreCatalog } from './lore-catalog';
import { CharacterLedger } from './character-ledger';
import { EquipmentRegistry } from './equipment-registry';
import savedScenesData from './data/saved-scenes.json';

/**
 * The ReferenceShelf provides quick lookups for authored lore (stories/chapters/arcs/moments), 
 * active characters, and available equipment. It mirrors the "DM gathers books" metaphor 
 * and must be accessible with low-latency cache semantics.
 * 
 * It integrates with LoreCatalog, CharacterLedger, and EquipmentRegistry to provide
 * a unified interface for the DreamweaverDirector.
 */
export class ReferenceShelf {
  private loreCatalog: LoreCatalog;
  private characterLedger: CharacterLedger;
  private equipmentRegistry: EquipmentRegistry;
  private savedScenes: Record<string, SceneDescriptor[]>;

  constructor() {
    this.loreCatalog = new LoreCatalog();
    this.characterLedger = new CharacterLedger();
    this.equipmentRegistry = new EquipmentRegistry();
    this.savedScenes = savedScenesData as Record<string, SceneDescriptor[]>;
  }

  // LoreCatalog methods
  async getStories(): Promise<Story[]> {
    return Promise.resolve(this.loreCatalog.getStories());
  }

  async getStory(storyId: string): Promise<Story | undefined> {
    return Promise.resolve(this.loreCatalog.getStory(storyId));
  }

  async getChapter(storyId: string, chapterId: string): Promise<Chapter | undefined> {
    // The lore catalog stores chapters by ID, but we need to find if it belongs to the right story
    const chapter = this.loreCatalog.getChapter(chapterId);
    if (chapter && chapter.storyId === storyId) {
      return chapter;
    }
    return undefined;
  }

  async getArc(storyId: string, chapterId: string, arcId: string): Promise<Arc | undefined> {
    // The lore catalog stores arcs by ID, but we need to find if it belongs to the right story/chapter
    const arc = this.loreCatalog.getArc(arcId);
    if (arc && arc.storyId === storyId && arc.chapterId === chapterId) {
      return arc;
    }
    return undefined;
  }

  async getMoment(storyId: string, chapterId: string, arcId: string, momentId: string): Promise<Moment | undefined> {
    // The lore catalog stores moments by ID, but we need to find if it belongs to the right story/chapter/arc
    const moment = this.loreCatalog.getMoment(momentId);
    if (moment && moment.storyId === storyId && moment.chapterId === chapterId && moment.arcId === arcId) {
      return moment;
    }
    return undefined;
  }

  async getMomentBundle(chapterId?: string, arcId?: string, moodTag?: string): Promise<Moment[]> {
    return Promise.resolve(this.loreCatalog.getMomentBundle(chapterId, arcId, moodTag));
  }

  // CharacterLedger methods
  async snapshotParty(): Promise<PartySnapshot> {
    return Promise.resolve(this.characterLedger.getPartySnapshot());
  }

  async getNPC(npcId: string): Promise<unknown> {
    return Promise.resolve(this.characterLedger.getNPC(npcId));
  }

  // EquipmentRegistry methods
  async listAvailableEquipment(): Promise<EquipmentItem[]> {
    // For now, return all available equipment. In a real scenario, this might be filtered based on party.
    return Promise.resolve(this.equipmentRegistry.getAllEquipment());
  }

  async getEquipmentForParty(partyId: string): Promise<EquipmentItem[]> {
    return Promise.resolve(this.equipmentRegistry.listForParty(partyId));
  }

  // Additional methods for narrative lookup
  async getLoreByReference(loreRef: { id: string; type: string }): Promise<Story | Chapter | Arc | Moment | undefined> {
    // This method would look up lore by reference based on type
    switch (loreRef.type) {
      case 'story':
        return this.getStory(loreRef.id);
      case 'chapter':
        // Need both storyId and chapterId to retrieve properly
        // This would require the storyId to be passed, for now returning undefined
        return undefined;
      case 'arc':
        return undefined; // Need storyId and chapterId too
      case 'moment':
        return undefined; // Need full hierarchical path
      default:
        return undefined;
    }
  }

  async getSavedScenesForMoment(momentId: string): Promise<SceneDescriptor[] | undefined> {
    // Validate momentId to prevent object injection
    if (!momentId || typeof momentId !== 'string' || momentId.length === 0) {
      return undefined;
    }
    // Use Object.prototype.hasOwnProperty to safely check for property existence
    if (this.savedScenes && typeof this.savedScenes === 'object' && Object.prototype.hasOwnProperty.call(this.savedScenes, momentId)) {
      return Promise.resolve(this.savedScenes[momentId]);
    }
    return undefined;
  }
}
