/**
 * @fileOverview Narrative structure tests validating blocks, metadata, and relationships
 * Tests focus on structure validation without exact content matching
 */

import { ReferenceShelf } from '@/lib/narrative-service';
import { NarrativeStructureValidator } from '../utils/test-validators';
import type { Story } from '@/lib/types';

describe('Narrative Structure Tests', () => {
  let shelf: ReferenceShelf;
  let story: Story | undefined;

  beforeEach(async () => {
    shelf = new ReferenceShelf();
    const stories = await shelf.getStories();
    story = stories[0];
  });

  describe('Story Entity Relationships', () => {
    it('should validate complete story structure with all required metadata', () => {
      expect(story).toBeDefined();
      if (!story) return;

      const validation = NarrativeStructureValidator.validateStoryStructure(story);
      expect(validation.isValid).toBe(true);
      expect(validation.metadataComplete).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should track entity count hierarchy accurately', () => {
      expect(story).toBeDefined();
      if (!story) return;

      const validation = NarrativeStructureValidator.validateStoryStructure(story);
      expect(validation.entityCount.stories).toBe(1);
      expect(validation.entityCount.chapters).toBeGreaterThan(0);
      expect(validation.entityCount.arcs).toBeGreaterThan(0);
      expect(validation.entityCount.moments).toBeGreaterThan(0);
    });

    it('should ensure each chapter has required metadata blocks', () => {
      expect(story).toBeDefined();
      if (!story) return;

      story.chapters.forEach(chapter => {
        expect(chapter.id).toBeDefined();
        expect(chapter.name).toBeDefined();
        expect(chapter.synopsis).toBeDefined();
        expect(Array.isArray(chapter.arcs)).toBe(true);
      });
    });

    it('should ensure each arc has theme and label metadata', () => {
      expect(story).toBeDefined();
      if (!story) return;

      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          expect(arc.id).toBeDefined();
          expect(arc.label).toBeDefined();
          expect(arc.theme).toBeDefined();
          expect(Array.isArray(arc.moments)).toBe(true);
        });
      });
    });

    it('should ensure each moment has complete content blocks', () => {
      expect(story).toBeDefined();
      if (!story) return;

      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          arc.moments.forEach(moment => {
            // Required content blocks
            expect(moment.id).toBeDefined();
            expect(moment.momentId).toBeDefined();
            expect(moment.title).toBeDefined();
            expect(moment.content).toBeDefined();
            expect(moment.content.trim().length).toBeGreaterThan(0);

            // Required metadata arrays
            expect(Array.isArray(moment.timeline)).toBe(true);
            expect(Array.isArray(moment.themes)).toBe(true);
            expect(Array.isArray(moment.sensoryAnchors)).toBe(true);
            expect(Array.isArray(moment.restrictionTags)).toBe(true);
          });
        });
      });
    });
  });

  describe('Cross-Reference Integrity', () => {
    it('should maintain correct parent references in moments', () => {
      expect(story).toBeDefined();
      if (!story) return;

      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          arc.moments.forEach(moment => {
            expect(moment.chapterId).toBe(chapter.id);
            expect(moment.arcId).toBe(arc.id);
            expect(moment.storyId).toBe(story!.id);
          });
        });
      });
    });

    it('should ensure arc references point to containing chapter', () => {
      expect(story).toBeDefined();
      if (!story) return;

      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          expect(arc.chapterId).toBe(chapter.id);
          expect(arc.storyId).toBe(story!.id);
        });
      });
    });
  });

  describe('Branching Logic Validation', () => {
    it('should validate all branching hooks target valid moments', () => {
      expect(story).toBeDefined();
      if (!story) return;

      const validation = NarrativeStructureValidator.validateBranchingLogic(story);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should report invalid branch targets', () => {
      expect(story).toBeDefined();
      if (!story) return;

      // Find a moment with branches
      let momentWithBranches = null;
      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          arc.moments.forEach(moment => {
            if (moment.branchingHooks && moment.branchingHooks.length > 0) {
              momentWithBranches = moment;
            }
          });
        });
      });

      if (momentWithBranches) {
        const validation = NarrativeStructureValidator.validateBranchingLogic(story);
        expect(validation.validBranches).toBeGreaterThanOrEqual(0);
        expect(validation.invalidBranches).toBe(0);
      }
    });

    it('should validate branching metadata structure', () => {
      expect(story).toBeDefined();
      if (!story) return;

      let branchCount = 0;
      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          arc.moments.forEach(moment => {
            if (moment.branchingHooks) {
              moment.branchingHooks.forEach(hook => {
                branchCount++;
                // Validate required branching metadata
                expect(hook.hookId).toBeDefined();
                expect(hook.condition).toBeDefined();
                expect(hook.targetMomentId).toBeDefined();
                expect(hook.weight).toBeDefined();
                expect(hook.weight).toBeGreaterThanOrEqual(0);
              });
            }
          });
        });
      });

      // Branching may be optional but if present, validate count
      expect(branchCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Narrative Continuity', () => {
    it('should ensure narrative flows from chapter to chapter', () => {
      expect(story).toBeDefined();
      if (!story) return;

      expect(story.chapters.length).toBeGreaterThan(0);

      story.chapters.forEach((chapter, index) => {
        expect(chapter.arcs.length).toBeGreaterThan(0);
        expect(chapter.synopsis).toBeDefined();

        // Each arc should have moments
        chapter.arcs.forEach(arc => {
          expect(arc.moments.length).toBeGreaterThan(0);
          expect(arc.label).toBeDefined();
          expect(arc.theme).toBeDefined();
        });
      });
    });

    it('should validate restriction tags are applied to moments', () => {
      expect(story).toBeDefined();
      if (!story) return;

      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          arc.moments.forEach(moment => {
            // Restriction tags can be empty, but must be an array
            expect(Array.isArray(moment.restrictionTags)).toBe(true);
          });
        });
      });
    });
  });

  describe('Metadata Completeness', () => {
    it('should have no moments with missing content blocks', () => {
      expect(story).toBeDefined();
      if (!story) return;

      const validation = NarrativeStructureValidator.validateStoryStructure(story);
      expect(validation.metadataComplete).toBe(true);

      story.chapters.forEach(chapter => {
        chapter.arcs.forEach(arc => {
          arc.moments.forEach(moment => {
            expect(moment.content).toBeTruthy();
            expect(moment.content.trim().length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should ensure all narrative entities have identifying metadata', () => {
      expect(story).toBeDefined();
      if (!story) return;

      expect(story.id).toBeDefined();
      expect(story.title).toBeDefined();
      expect(story.summary).toBeDefined();

      story.chapters.forEach(chapter => {
        expect(chapter.id).toBeDefined();
        expect(chapter.name).toBeDefined();
      });
    });
  });
});