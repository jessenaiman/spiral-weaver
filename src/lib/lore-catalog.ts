import type { Story, Chapter, Arc, Moment } from './types';
import narrativeData from './data/sample-narrative.json';

/**
 * The LoreCatalog stores and provides access to all authored narrative content
 * (stories, chapters, arcs, moments) with quick lookup capabilities.
 */
export class LoreCatalog {
  private stories: Map<string, Story>;
  private chapters: Map<string, Chapter>;
  private arcs: Map<string, Arc>;
  private moments: Map<string, Moment>;

  constructor() {
    this.stories = new Map();
    this.chapters = new Map();
    this.arcs = new Map();
    this.moments = new Map();
    
    // Initialize with sample data
    this.loadNarrativeData();
  }

  private loadNarrativeData() {
    const narrative = narrativeData;
    if (narrative.stories && narrative.stories.length > 0) {
      narrative.stories.forEach((storyData: any) => {
        const story: Story = {
          id: storyData.storyId,
          title: storyData.title,
          summary: storyData.summary,
          chapters: [],
        };

        storyData.chapters.forEach((chapterData: any) => {
          const chapter: Chapter = {
            id: chapterData.chapterId,
            name: chapterData.name,
            synopsis: chapterData.synopsis,
            metadata: chapterData.metadata,
            title: chapterData.name,
            storyId: story.id,
            arcs: [],
          };

          chapterData.arcs.forEach((arcData: any) => {
            const arc: Arc = {
              id: arcData.arcId,
              label: arcData.label,
              theme: arcData.theme,
              title: arcData.label,
              chapterId: chapter.id,
              storyId: story.id,
              moments: [],
            };

            arcData.moments.forEach((momentData: any) => {
              const moment: Moment = {
                ...momentData,
                id: momentData.momentId,
                momentId: momentData.momentId,
                arcId: arc.id,
                chapterId: chapter.id,
                storyId: story.id,
              };

              // Add to lookup maps
              this.moments.set(moment.id, moment);
              arc.moments.push(moment);
            });

            this.arcs.set(arc.id, arc);
            chapter.arcs.push(arc);
          });

          this.chapters.set(chapter.id, chapter);
          story.chapters.push(chapter);
        });

        this.stories.set(story.id, story);
      });
    }
  }

  getStory(storyId: string): Story | undefined {
    return this.stories.get(storyId);
  }

  getStories(): Story[] {
    return Array.from(this.stories.values());
  }

  getChapter(chapterId: string): Chapter | undefined {
    return this.chapters.get(chapterId);
  }

  getArc(arcId: string): Arc | undefined {
    return this.arcs.get(arcId);
  }

  getMoment(momentId: string): Moment | undefined {
    return this.moments.get(momentId);
  }

  /**
   * Retrieves a bundle of moments that match specific criteria
   */
  getMomentBundle(chapterId?: string, arcId?: string, moodTag?: string): Moment[] {
    let moments = Array.from(this.moments.values());
    
    if (chapterId) {
      moments = moments.filter(m => m.chapterId === chapterId);
    }
    
    if (arcId) {
      moments = moments.filter(m => m.arcId === arcId);
    }
    
    if (moodTag) {
      moments = moments.filter(m => m.themes?.includes(moodTag));
    }
    
    return moments;
  }
}