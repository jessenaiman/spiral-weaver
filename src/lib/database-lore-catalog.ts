
import { PrismaClient, Story, Chapter, Arc, Moment } from '@prisma/client';

/**
 * Provides database-backed access to narrative data (stories, chapters, arcs, moments) using Prisma.
 * Supports loading and saving narrative hierarchy for the Dreamweaver application.
 */
export class DatabaseLoreCatalog {
  private prisma: PrismaClient;

  /**
   * Constructs a new DatabaseLoreCatalog with a Prisma client instance.
   */
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Loads all stories with their chapters, arcs, and moments from the database.
   * @returns Promise resolving to an array of Story objects with nested data.
   */
  async getStories(): Promise<Story[]> {
    return this.prisma.story.findMany({
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
  }

  /**
   * Loads a specific story and its full hierarchy by storyId.
   * @param storyId The storyId to query.
   * @returns Promise resolving to the Story or null if not found.
   */
  async getStory(storyId: string): Promise<Story | null> {
    return this.prisma.story.findUnique({
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
  }

  /**
   * Loads a specific chapter and its arcs/moments by storyId and chapterId.
   * @param storyId The parent storyId.
   * @param chapterId The chapterId to query.
   * @returns Promise resolving to the Chapter or null if not found.
   */
  async getChapter(storyId: string, chapterId: string): Promise<Chapter | null> {
    return this.prisma.chapter.findFirst({
      where: {
        chapterId,
        storyId,
      },
      include: {
        arcs: {
          include: {
            moments: true,
          },
        },
      },
    });
  }

  /**
   * Loads a specific arc and its moments by storyId, chapterId, and arcId.
   * @param storyId The parent storyId.
   * @param chapterId The parent chapterId.
   * @param arcId The arcId to query.
   * @returns Promise resolving to the Arc or null if not found.
   */
  async getArc(storyId: string, chapterId: string, arcId: string): Promise<Arc | null> {
    return this.prisma.arc.findFirst({
      where: {
        arcId,
        chapter: {
          chapterId,
          storyId,
        },
      },
      include: {
        moments: true,
      },
    });
  }

  /**
   * Loads a specific moment by full hierarchy path.
   * @param storyId The parent storyId.
   * @param chapterId The parent chapterId.
   * @param arcId The parent arcId.
   * @param momentId The momentId to query.
   * @returns Promise resolving to the Moment or null if not found.
   */
  async getMoment(storyId: string, chapterId: string, arcId: string, momentId: string): Promise<Moment | null> {
    return this.prisma.moment.findFirst({
      where: {
        momentId,
        arc: {
          arcId,
          chapter: {
            chapterId,
            storyId,
          },
        },
      },
    });
  }

  /**
   * Loads all moments for a given chapter or arc.
   * @param chapterId Optional chapterId to filter moments.
   * @param arcId Optional arcId to filter moments.
   * @returns Promise resolving to an array of Moment objects.
   */
  async getMomentBundle(chapterId?: string, arcId?: string): Promise<Moment[]> {
    let where: any = {};

    if (arcId) {
      where.arcId = arcId;
    } else if (chapterId) {
      where.arc = {
        chapterId,
      };
    }

    return this.prisma.moment.findMany({
      where,
    });
  }

  /**
   * Saves or updates a story in the database.
   * @param storyData The story data to save.
   * @returns Promise resolving to the upserted Story.
   */
  async saveStory(storyData: { storyId: string; title: string; summary: string }): Promise<Story> {
    return this.prisma.story.upsert({
      where: { storyId: storyData.storyId },
      update: storyData,
      create: storyData,
    });
  }

  /**
   * Saves or updates a chapter in the database.
   * @param storyId The parent storyId.
   * @param chapterData The chapter data to save.
   * @returns Promise resolving to the upserted Chapter.
   */
  async saveChapter(storyId: string, chapterData: { chapterId: string; name: string; synopsis: string; metadata?: any }): Promise<Chapter> {
    return this.prisma.chapter.upsert({
      where: { chapterId: chapterData.chapterId },
      update: { ...chapterData, storyId, metadata: chapterData.metadata ? JSON.stringify(chapterData.metadata) : '{}' },
      create: { ...chapterData, storyId, metadata: chapterData.metadata ? JSON.stringify(chapterData.metadata) : '{}' },
    });
  }

  /**
   * Saves or updates an arc in the database.
   * @param chapterId The parent chapterId.
   * @param arcData The arc data to save.
   * @returns Promise resolving to the upserted Arc.
   */
  async saveArc(chapterId: string, arcData: { arcId: string; label: string; theme: string }): Promise<Arc> {
    return this.prisma.arc.upsert({
      where: { arcId: arcData.arcId },
      update: { ...arcData, chapterId },
      create: { ...arcData, chapterId },
    });
  }

  /**
   * Saves or updates a moment in the database.
   * @param arcId The parent arcId.
   * @param momentData The moment data to save.
   * @returns Promise resolving to the upserted or created Moment.
   */
  async saveMoment(arcId: string, momentData: Partial<Moment>): Promise<Moment> {
    const { id, ...data } = momentData;
    if (id) {
      return this.prisma.moment.update({
        where: { id },
        data: { ...data, arcId },
      });
    } else {
      return this.prisma.moment.create({
        data: { ...data, arcId } as any,
      });
    }
  }

  /**
   * Disconnects the Prisma client from the database.
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}