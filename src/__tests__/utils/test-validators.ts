/**
 * @fileOverview Test utilities for validating narrative blocks, metadata, and structure
 * without testing exact content. Designed for creative teams to validate game mechanics.
 */

import type { Story, Chapter, Arc, Moment, SceneDescriptor, RuntimeContext } from '@/lib/types';

/**
 * Validates that narrative entities are correctly linked and metadata is complete
 */
export class NarrativeStructureValidator {
  /**
   * Validates story structure and entity relationships
   * @param story The story to validate
   * @returns Validation result with metadata completeness
   */
  static validateStoryStructure(story: Story): {
    isValid: boolean;
    metadataComplete: boolean;
    entityCount: { stories: number; chapters: number; arcs: number; moments: number };
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required story metadata
    if (!story.id || !story.title) {
      errors.push('Story missing required metadata: id or title');
    }

    // Validate chapters
    if (!story.chapters || story.chapters.length === 0) {
      errors.push('Story must have at least one chapter');
    }

    let totalArcs = 0;
    let totalMoments = 0;

    story.chapters.forEach((chapter, chapterIndex) => {
      if (!chapter.id || !chapter.name) {
        errors.push(`Chapter ${chapterIndex} missing required metadata: id or name`);
      }

      if (!chapter.arcs || chapter.arcs.length === 0) {
        errors.push(`Chapter ${chapter.id} must have at least one arc`);
      }

      chapter.arcs.forEach((arc, arcIndex) => {
        totalArcs++;
        if (!arc.id || !arc.label) {
          errors.push(`Arc ${arcIndex} in chapter ${chapter.id} missing required metadata: id or label`);
        }

        if (!arc.moments || arc.moments.length === 0) {
          errors.push(`Arc ${arc.id} must have at least one moment`);
        }

        arc.moments.forEach((moment, momentIndex) => {
          totalMoments++;
          if (!moment.id || !moment.momentId || !moment.title || !moment.content) {
            errors.push(`Moment ${momentIndex} in arc ${arc.id} missing required metadata or content`);
          }

          // Validate cross-references
          if (moment.arcId !== arc.id) {
            errors.push(`Moment ${moment.id} arcId does not match containing arc ${arc.id}`);
          }
          if (moment.chapterId !== chapter.id) {
            errors.push(`Moment ${moment.id} chapterId does not match containing chapter ${chapter.id}`);
          }
          if (moment.storyId !== story.id) {
            errors.push(`Moment ${moment.id} storyId does not match containing story ${story.id}`);
          }
        });
      });
    });

    return {
      isValid: errors.length === 0,
      metadataComplete: errors.length === 0,
      entityCount: {
        stories: 1,
        chapters: story.chapters.length,
        arcs: totalArcs,
        moments: totalMoments,
      },
      errors,
    };
  }

  /**
   * Validates branching hooks and their target references
   * @param story The story to validate branching in
   * @returns Validation result for branching logic
   */
  static validateBranchingLogic(story: Story): {
    isValid: boolean;
    validBranches: number;
    invalidBranches: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let validBranches = 0;
    let invalidBranches = 0;

    story.chapters.forEach(chapter => {
      chapter.arcs.forEach(arc => {
        arc.moments.forEach(moment => {
          if (moment.branchingHooks) {
            moment.branchingHooks.forEach((hook, hookIndex) => {
              // Find target moment
              const targetMoment = this.findMomentById(story, hook.targetMomentId);
              if (!targetMoment) {
                errors.push(`Branch ${hookIndex} in moment ${moment.id} targets invalid moment: ${hook.targetMomentId}`);
                invalidBranches++;
              } else {
                validBranches++;
              }

              // Validate weight if present
              if (hook.weight !== undefined && hook.weight < 0) {
                errors.push(`Branch ${hookIndex} in moment ${moment.id} has invalid weight: ${hook.weight}`);
                invalidBranches++;
              }
            });
          }
        });
      });
    });

    return {
      isValid: errors.length === 0,
      validBranches,
      invalidBranches,
      errors,
    };
  }

  /**
   * Helper to find a moment by ID across the entire story
   * @param story The story to search in
   * @param momentId The moment ID to find
   * @returns The moment if found, undefined otherwise
   */
  private static findMomentById(story: Story, momentId: string): Moment | undefined {
    for (const chapter of story.chapters) {
      for (const arc of chapter.arcs) {
        const moment = arc.moments.find(m => m.id === momentId || m.momentId === momentId);
        if (moment) return moment;
      }
    }
    return undefined;
  }
}

/**
 * Validates scene descriptors for required blocks and metadata
 */
export class SceneValidator {
  /**
   * Validates scene descriptor has all required blocks and metadata
   * @param scene The scene descriptor to validate
   * @returns Validation result for scene structure
   */
  static validateSceneDescriptor(scene: SceneDescriptor): {
    isValid: boolean;
    hasRequiredBlocks: boolean;
    metadataComplete: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required blocks
    if (!scene.sceneId) errors.push('Scene missing sceneId');
    if (!scene.title) errors.push('Scene missing title');
    if (!scene.narrativeText || scene.narrativeText.trim().length === 0) {
      errors.push('Scene missing narrativeText');
    }
    if (!scene.mood) errors.push('Scene missing mood');

    // Check metadata arrays exist (can be empty)
    if (!Array.isArray(scene.assetHooks)) errors.push('Scene assetHooks must be array');
    if (!Array.isArray(scene.recommendedChoices)) errors.push('Scene recommendedChoices must be array');
    if (!Array.isArray(scene.partyHighlights)) errors.push('Scene partyHighlights must be array');
    if (!Array.isArray(scene.equipmentHighlights)) errors.push('Scene equipmentHighlights must be array');
    if (!Array.isArray(scene.branchOptions)) errors.push('Scene branchOptions must be array');

    // Check diagnostics metadata
    if (!scene.diagnostics) {
      errors.push('Scene missing diagnostics');
    } else {
      if (!Array.isArray(scene.diagnostics.appliedRestrictions)) {
        errors.push('Scene diagnostics appliedRestrictions must be array');
      }
      if (!Array.isArray(scene.diagnostics.moodAdjustments)) {
        errors.push('Scene diagnostics moodAdjustments must be array');
      }
      if (!scene.diagnostics.branchForecast) {
        errors.push('Scene diagnostics missing branchForecast');
      }
    }

    return {
      isValid: errors.length === 0,
      hasRequiredBlocks: !errors.some(e => e.includes('missing')),
      metadataComplete: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates that scene reflects runtime context changes
   * @param scene The generated scene
   * @param context The runtime context used for generation
   * @returns Validation result for context integration
   */
  static validateContextIntegration(scene: SceneDescriptor, context: RuntimeContext): {
    isValid: boolean;
    contextReflected: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if scene diagnostics reflect context
    if (scene.diagnostics) {
      // Mood should be reflected in diagnostics or scene mood
      if (context.currentMood && !scene.mood.toLowerCase().includes(context.currentMood.toLowerCase())) {
        // This is a warning rather than error - mood might be transformed
        errors.push(`Scene mood '${scene.mood}' may not reflect context mood '${context.currentMood}'`);
      }

      // Environment should be reflected in diagnostics
      if (context.environmentState && scene.diagnostics.branchForecast) {
        if (!scene.diagnostics.branchForecast.toLowerCase().includes(context.environmentState.toLowerCase())) {
          errors.push('Scene diagnostics may not reflect environment state');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      contextReflected: errors.length === 0,
      errors,
    };
  }
}

/**
 * Validates Dreamweaver personality influence on scene structure
 */
export class PersonalityValidator {
  /**
   * Validates that different personalities produce distinct scene structures
   * @param scenes Array of scenes generated with different personalities
   * @returns Validation result for personality differentiation
   */
  static validatePersonalityInfluence(scenes: Array<{ scene: SceneDescriptor; personality: string }>): {
    isValid: boolean;
    personalitiesDistinct: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (scenes.length < 2) {
      errors.push('Need at least 2 scenes with different personalities to validate differentiation');
      return { isValid: false, personalitiesDistinct: false, errors };
    }

    // Check for basic structural differences
    const personalities = scenes.map(s => s.personality);
    const uniquePersonalities = new Set(personalities);

    if (uniquePersonalities.size < 2) {
      errors.push('Scenes must use different personalities to validate differentiation');
    }

    // Validate that scenes have different structural elements
    // (This is a basic check - more sophisticated validation would use LLM)
    const luminariScenes = scenes.filter(s => s.personality === 'Luminari');
    const shadowScenes = scenes.filter(s => s.personality === 'Shadow');
    const chroniclerScenes = scenes.filter(s => s.personality === 'Chronicler');

    if (luminariScenes.length > 0 && shadowScenes.length > 0) {
      // Basic differentiation check - scenes should have different moods or branch options
      const luminariMood = luminariScenes[0].scene.mood;
      const shadowMood = shadowScenes[0].scene.mood;

      if (luminariMood === shadowMood) {
        errors.push('Luminari and Shadow scenes should have different moods');
      }
    }

    return {
      isValid: errors.length === 0,
      personalitiesDistinct: errors.length === 0,
      errors,
    };
  }
}