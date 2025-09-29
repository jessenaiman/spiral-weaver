import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import type { Story, PartySnapshot, EquipmentItem, Chapter, Arc, Moment } from '@/lib/types';
import partyData from './data/sample-party.json';
import equipmentData from './data/sample-equipment.json';

const prisma = new PrismaClient().$extends(withAccelerate())

// Helper to parse JSON fields from the database
function parseJSONFields(obj: any, fields: string[]) {
  if (!obj) return obj;
  const newObj = { ...obj };
  for (const field of fields) {
    if (newObj[field] && typeof newObj[field] === 'string') {
      try {
        newObj[field] = JSON.parse(newObj[field]);
      } catch (e) {
        console.error(`Failed to parse JSON for field ${field}:`, e);
      }
    }
  }
  return newObj;
}


// This service simulates the ReferenceShelf, LoreCatalog, CharacterLedger, and EquipmentRegistry
export class ReferenceShelf {
  private party: PartySnapshot;
  private equipment: EquipmentItem[];

  constructor() {
    this.party = partyData as PartySnapshot;
    this.equipment = equipmentData as EquipmentItem[];
  }

  // Simulates LoreCatalog, now fetching from the database via Prisma
  async getStories(): Promise<Story[]> {
    const stories = await prisma.story.findMany({
      include: {
        chapters: {
          include: {
            arcs: {
              include: {
                moments: true,
              },
            },
          },
        },
      },
    });

    // Manually parse JSON string fields
    return stories.map(story => ({
      ...story,
      chapters: story.chapters.map(chapter => {
        const parsedChapter = parseJSONFields(chapter, ['metadata']);
        return {
          ...parsedChapter,
          arcs: parsedChapter.arcs.map((arc: any) => ({
            ...arc,
            moments: arc.moments.map((moment: any) => parseJSONFields(moment, [
              'timeline',
              'themes',
              'lore',
              'subtext',
              'narrativeBeats',
              'branchingHooks',
              'sensoryAnchors',
              'loreRefs',
              'restrictionTags'
            ])),
          })),
        }
      }),
    })) as unknown as Story[];
  }

  async getStory(storyId: string): Promise<Story | undefined> {
    const story = await prisma.story.findUnique({
      where: { storyId },
      include: {
        chapters: {
          include: {
            arcs: {
              include: {
                moments: true,
              },
            },
          },
        },
      },
    });

    if (!story) return undefined;

    const parsedStory = {
      ...story,
      chapters: story.chapters.map(chapter => {
        const parsedChapter = parseJSONFields(chapter, ['metadata']);
        return {
          ...parsedChapter,
          arcs: parsedChapter.arcs.map((arc: any) => ({
            ...arc,
            moments: arc.moments.map((moment: any) => parseJSONFields(moment, [
              'timeline',
              'themes',
              'lore',
              'subtext',
              'narrativeBeats',
              'branchingHooks',
              'sensoryAnchors',
              'loreRefs',
              'restrictionTags'
            ])),
          })),
        }
      }),
    }
    return parsedStory as unknown as Story;
  }

  async getChapter(storyId: string, chapterId: string): Promise<Chapter | undefined> {
    const chapter = await prisma.chapter.findUnique({
      where: { chapterId },
    });
    return parseJSONFields(chapter, ['metadata']) as unknown as Chapter;
  }

  async getArc(storyId: string, chapterId: string, arcId: string): Promise<Arc | undefined> {
     const arc = await prisma.arc.findUnique({
      where: { arcId },
       include: {
         moments: true
       }
    });

    if (!arc) return undefined;

    const parsedArc = {
        ...arc,
        moments: arc.moments.map((moment: any) => parseJSONFields(moment, [
          'timeline',
          'themes',
          'lore',
          'subtext',
          'narrativeBeats',
          'branchingHooks',
          'sensoryAnchors',
          'loreRefs',
          'restrictionTags'
        ])),
    }
    return parsedArc as unknown as Arc;
  }

  async getMoment(storyId: string, chapterId: string, arcId: string, momentId: string): Promise<Moment | undefined> {
    const moment = await prisma.moment.findUnique({
      where: { momentId },
    });
     return parseJSONFields(moment, [
      'timeline',
      'themes',
      'lore',
      'subtext',
      'narrativeBeats',
      'branchingHooks',
      'sensoryAnchors',
      'loreRefs',
      'restrictionTags'
    ]) as unknown as Moment;
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
