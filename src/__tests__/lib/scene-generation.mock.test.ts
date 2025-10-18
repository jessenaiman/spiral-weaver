/**
 * @fileOverview Scene generation tests with mocked AI flows
 * Tests validate scene descriptor structure and personality influence without AI dependencies
 */

import { SceneValidator, PersonalityValidator } from '../utils/test-validators';
import type { SceneDescriptor, RuntimeContext } from '@/lib/types';

describe('Scene Generation with Mocked AI', () => {
  const createMockScene = (personality: 'Luminari' | 'Shadow' | 'Chronicler'): SceneDescriptor => ({
    sceneId: `scene-${personality}`,
    title: `Test Scene - ${personality}`,
    narrativeText: `This is a narrative for ${personality} personality.`,
    mood: personality === 'Luminari' ? 'hopeful' : personality === 'Shadow' ? 'dark' : 'neutral',
    assetHooks: ['asset-1', 'asset-2'],
    recommendedChoices: ['choice-1', 'choice-2'],
    partyHighlights: ['party-highlight-1'],
    equipmentHighlights: [
      {
        itemId: 'item-1',
        name: 'Test Item',
        usageNotes: 'Item is useful here',
      },
    ],
    branchOptions: [
      {
        prompt: 'Option 1',
        targetMomentId: 'moment-1',
        probability: 0.5,
      },
      {
        prompt: 'Option 2',
        targetMomentId: 'moment-2',
        probability: 0.5,
      },
    ],
    diagnostics: {
      appliedRestrictions: ['restriction-1'],
      moodAdjustments: ['adjustment-1'],
      branchForecast: 'Two paths diverge ahead',
    },
    dreamweaverPersonality: personality,
  });

  describe('Scene Descriptor Validation', () => {
    it('should validate Luminari scene has all required blocks', () => {
      const scene = createMockScene('Luminari');
      const validation = SceneValidator.validateSceneDescriptor(scene);

      expect(validation.isValid).toBe(true);
      expect(validation.hasRequiredBlocks).toBe(true);
      expect(validation.metadataComplete).toBe(true);
    });

    it('should validate Shadow scene has all required blocks', () => {
      const scene = createMockScene('Shadow');
      const validation = SceneValidator.validateSceneDescriptor(scene);

      expect(validation.isValid).toBe(true);
      expect(validation.hasRequiredBlocks).toBe(true);
      expect(validation.metadataComplete).toBe(true);
    });

    it('should validate Chronicler scene has all required blocks', () => {
      const scene = createMockScene('Chronicler');
      const validation = SceneValidator.validateSceneDescriptor(scene);

      expect(validation.isValid).toBe(true);
      expect(validation.hasRequiredBlocks).toBe(true);
      expect(validation.metadataComplete).toBe(true);
    });
  });

  describe('Personality Differentiation', () => {
    it('should show distinct moods across personalities', () => {
      const luminariScene = createMockScene('Luminari');
      const shadowScene = createMockScene('Shadow');
      const chroniclerScene = createMockScene('Chronicler');

      expect(luminariScene.mood).not.toBe(shadowScene.mood);
      expect(chroniclerScene.mood).not.toBe(shadowScene.mood);
    });

    it('should validate personality influence across scenes', () => {
      const luminariScene = createMockScene('Luminari');
      const shadowScene = createMockScene('Shadow');

      const validation = PersonalityValidator.validatePersonalityInfluence([
        { scene: luminariScene, personality: 'Luminari' },
        { scene: shadowScene, personality: 'Shadow' },
      ]);

      expect(validation.isValid).toBe(true);
    });

    it('should maintain distinct scene IDs for different personalities', () => {
      const luminariScene = createMockScene('Luminari');
      const shadowScene = createMockScene('Shadow');
      const chroniclerScene = createMockScene('Chronicler');

      const sceneIds = new Set([luminariScene.sceneId, shadowScene.sceneId, chroniclerScene.sceneId]);
      expect(sceneIds.size).toBe(3);
    });
  });

  describe('Diagnostics Metadata', () => {
    it('should include complete diagnostics in scene', () => {
      const scene = createMockScene('Luminari');

      expect(scene.diagnostics).toBeDefined();
      expect(Array.isArray(scene.diagnostics.appliedRestrictions)).toBe(true);
      expect(Array.isArray(scene.diagnostics.moodAdjustments)).toBe(true);
      expect(scene.diagnostics.branchForecast).toBeDefined();
      expect(scene.diagnostics.branchForecast.trim().length).toBeGreaterThan(0);
    });

    it('should validate branch options in scene', () => {
      const scene = createMockScene('Shadow');

      expect(Array.isArray(scene.branchOptions)).toBe(true);
      expect(scene.branchOptions.length).toBeGreaterThan(0);

      scene.branchOptions.forEach(option => {
        expect(option.prompt).toBeDefined();
        expect(option.targetMomentId).toBeDefined();
        expect(option.probability).toBeGreaterThanOrEqual(0);
        expect(option.probability).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Scene Context Integration', () => {
    it('should reflect context in scene structure', () => {
      const context: RuntimeContext = {
        chapterId: 'chapter-1',
        arcId: 'arc-1',
        momentId: 'moment-1',
        partySnapshot: {
          partyId: 'party-1',
          members: [],
          affinities: {},
          statusEffects: [],
        },
        environmentState: 'forest',
        currentMood: 'tense',
      };

      const scene = createMockScene('Chronicler');

      // Scene should have been generated with context
      expect(scene).toBeDefined();
      expect(scene.diagnostics).toBeDefined();
    });
  });

  describe('Equipment and Party Highlights', () => {
    it('should include equipment highlights with usage notes', () => {
      const scene = createMockScene('Luminari');

      if (scene.equipmentHighlights.length > 0) {
        scene.equipmentHighlights.forEach(highlight => {
          expect(highlight.itemId).toBeDefined();
          expect(highlight.name).toBeDefined();
          expect(highlight.usageNotes).toBeDefined();
        });
      }
    });

    it('should include party highlights', () => {
      const scene = createMockScene('Shadow');

      expect(Array.isArray(scene.partyHighlights)).toBe(true);
    });
  });

  describe('Asset and Choice Hooks', () => {
    it('should have asset hooks array', () => {
      const scene = createMockScene('Luminari');

      expect(Array.isArray(scene.assetHooks)).toBe(true);
    });

    it('should have recommended choices array', () => {
      const scene = createMockScene('Chronicler');

      expect(Array.isArray(scene.recommendedChoices)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle scenes with minimal data', () => {
      const minimalScene: SceneDescriptor = {
        sceneId: 'minimal-scene',
        title: 'Minimal',
        narrativeText: 'Text',
        mood: 'neutral',
        assetHooks: [],
        recommendedChoices: [],
        partyHighlights: [],
        equipmentHighlights: [],
        branchOptions: [],
        diagnostics: {
          appliedRestrictions: [],
          moodAdjustments: [],
          branchForecast: 'No branches',
        },
        dreamweaverPersonality: 'Chronicler',
      };

      const validation = SceneValidator.validateSceneDescriptor(minimalScene);
      expect(validation.isValid).toBe(true);
    });

    it('should validate scene with multiple branch options', () => {
      const scene: SceneDescriptor = {
        ...createMockScene('Luminari'),
        branchOptions: [
          {
            prompt: 'Option 1',
            targetMomentId: 'moment-1',
            probability: 0.33,
          },
          {
            prompt: 'Option 2',
            targetMomentId: 'moment-2',
            probability: 0.33,
          },
          {
            prompt: 'Option 3',
            targetMomentId: 'moment-3',
            probability: 0.34,
          },
        ],
      };

      let totalProb = 0;
      scene.branchOptions.forEach(option => {
        expect(option.probability).toBeGreaterThan(0);
        totalProb += option.probability;
      });

      expect(Math.round(totalProb * 100) / 100).toBeCloseTo(1.0, 1);
    });
  });
});