/**
 * @fileOverview Mood and environment tests with mocked data
 * Tests validate diagnostics metadata and context integration without AI dependencies
 */

import { SceneValidator } from '../utils/test-validators';
import type { SceneDescriptor } from '@/lib/types';

describe('Mood and Environment with Mocked Data', () => {
  const createSceneWithContext = (mood: string, environment: string): SceneDescriptor => ({
    sceneId: `scene-${mood}-${environment}`,
    title: `Scene in ${environment} with ${mood} mood`,
    narrativeText: `A scene unfolding in a ${environment} with a ${mood} atmosphere.`,
    mood,
    assetHooks: ['asset-environment', 'asset-mood'],
    recommendedChoices: ['action-1', 'action-2'],
    partyHighlights: ['party-note-1'],
    equipmentHighlights: [
      {
        itemId: 'equipment-1',
        name: 'Context Relevant Item',
        usageNotes: `Item is useful in ${environment}`,
      },
    ],
    branchOptions: [
      {
        prompt: 'Option A',
        targetMomentId: 'moment-a',
        probability: 0.5,
      },
      {
        prompt: 'Option B',
        targetMomentId: 'moment-b',
        probability: 0.5,
      },
    ],
    diagnostics: {
      appliedRestrictions: [`environment-${environment}`],
      moodAdjustments: [`mood-${mood}`],
      branchForecast: `Two paths in the ${environment}`,
    },
    dreamweaverPersonality: 'Luminari',
  });

  describe('Mood Metadata', () => {
    it('should reflect tense mood in scene generation', () => {
      const scene = createSceneWithContext('tense', 'forest');

      expect(scene.mood).toBe('tense');
      expect(scene.diagnostics.moodAdjustments).toContain('mood-tense');
    });

    it('should reflect peaceful mood in scene generation', () => {
      const scene = createSceneWithContext('peaceful', 'village');

      expect(scene.mood).toBe('peaceful');
      expect(scene.diagnostics.moodAdjustments).toContain('mood-peaceful');
    });

    it('should track mood adjustments in diagnostics', () => {
      const moods = ['tense', 'peaceful', 'mysterious', 'triumphant'];

      moods.forEach(mood => {
        const scene = createSceneWithContext(mood, 'generic');

        expect(scene.diagnostics.moodAdjustments).toBeDefined();
        expect(Array.isArray(scene.diagnostics.moodAdjustments)).toBe(true);
        expect(scene.diagnostics.moodAdjustments.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Environment State', () => {
    it('should reflect environment in diagnostics', () => {
      const scene = createSceneWithContext('neutral', 'dark_dungeon');

      expect(scene.diagnostics.appliedRestrictions).toContain('environment-dark_dungeon');
      expect(scene.diagnostics.branchForecast).toContain('dark_dungeon');
    });

    it('should handle various environment states', () => {
      const environments = ['forest', 'cave', 'village', 'castle', 'ocean'];

      environments.forEach(env => {
        const scene = createSceneWithContext('neutral', env);

        expect(scene).toBeDefined();
        expect(scene.diagnostics.appliedRestrictions).toContain(`environment-${env}`);
      });
    });

    it('should integrate environment in asset hooks', () => {
      const scene = createSceneWithContext('intense', 'volcanic_plains');

      expect(scene.assetHooks).toBeDefined();
      expect(Array.isArray(scene.assetHooks)).toBe(true);
      expect(scene.assetHooks.length).toBeGreaterThan(0);
    });
  });

  describe('Diagnostics Metadata Complete', () => {
    it('should generate complete diagnostics metadata', () => {
      const scene = createSceneWithContext('reverent', 'temple');
      const validation = SceneValidator.validateSceneDescriptor(scene);

      expect(validation.isValid).toBe(true);
      expect(scene.diagnostics).toBeDefined();
      expect(scene.diagnostics.appliedRestrictions).toBeDefined();
      expect(Array.isArray(scene.diagnostics.appliedRestrictions)).toBe(true);
      expect(scene.diagnostics.moodAdjustments).toBeDefined();
      expect(Array.isArray(scene.diagnostics.moodAdjustments)).toBe(true);
      expect(scene.diagnostics.branchForecast).toBeDefined();
    });

    it('should track applied restrictions in diagnostics', () => {
      const scene = createSceneWithContext('cautious', 'restricted_area');

      if (scene.diagnostics.appliedRestrictions.length > 0) {
        scene.diagnostics.appliedRestrictions.forEach(restriction => {
          expect(typeof restriction).toBe('string');
          expect(restriction.trim().length).toBeGreaterThan(0);
        });
      }
    });

    it('should generate branch forecast in diagnostics', () => {
      const scene = createSceneWithContext('uncertain', 'crossroads');

      expect(scene.diagnostics.branchForecast).toBeDefined();
      expect(scene.diagnostics.branchForecast.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Mood and Environment Combinations', () => {
    it('should handle peaceful forest combination', () => {
      const scene = createSceneWithContext('peaceful', 'forest');

      expect(scene.mood).toBe('peaceful');
      expect(scene.diagnostics.appliedRestrictions).toContain('environment-forest');
      expect(scene.diagnostics.moodAdjustments).toContain('mood-peaceful');
    });

    it('should handle tense dungeon combination', () => {
      const scene = createSceneWithContext('tense', 'dark_dungeon');

      expect(scene.mood).toBe('tense');
      expect(scene.diagnostics.appliedRestrictions).toContain('environment-dark_dungeon');
      expect(scene.diagnostics.moodAdjustments).toContain('mood-tense');
    });

    it('should handle mysterious temple combination', () => {
      const scene = createSceneWithContext('mysterious', 'temple');

      expect(scene.mood).toBe('mysterious');
      expect(scene.diagnostics.appliedRestrictions).toContain('environment-temple');
      expect(scene.diagnostics.moodAdjustments).toContain('mood-mysterious');
    });
  });

  describe('Extreme Conditions', () => {
    it('should handle extreme mood conditions', () => {
      const extremeMoods = ['absolute_despair', 'ecstatic_joy', 'consuming_rage'];

      extremeMoods.forEach(mood => {
        const scene = createSceneWithContext(mood, 'normal');

        expect(scene).toBeDefined();
        expect(scene.mood).toBe(mood);
        expect(scene.diagnostics.moodAdjustments).toContain(`mood-${mood}`);
      });
    });

    it('should handle extreme environment conditions', () => {
      const extremeEnvs = ['outer_void', 'primordial_chaos', 'interdimensional_rift'];

      extremeEnvs.forEach(env => {
        const scene = createSceneWithContext('neutral', env);

        expect(scene).toBeDefined();
        expect(scene.diagnostics).toBeDefined();
        expect(scene.diagnostics.appliedRestrictions).toContain(`environment-${env}`);
      });
    });
  });

  describe('Branch Options with Context', () => {
    it('should validate branch options reflect context', () => {
      const scene = createSceneWithContext('uncertain', 'crossroads');

      expect(scene.branchOptions).toBeDefined();
      expect(Array.isArray(scene.branchOptions)).toBe(true);

      scene.branchOptions.forEach(option => {
        expect(option.prompt).toBeDefined();
        expect(option.targetMomentId).toBeDefined();
        expect(option.probability).toBeGreaterThanOrEqual(0);
        expect(option.probability).toBeLessThanOrEqual(1);
      });
    });

    it('should ensure branch probabilities sum correctly', () => {
      const scene = createSceneWithContext('neutral', 'generic');

      let totalProb = 0;
      scene.branchOptions.forEach(option => {
        totalProb += option.probability;
      });

      expect(Math.round(totalProb * 100) / 100).toBeCloseTo(1.0, 1);
    });
  });

  describe('Scene Validation with Context', () => {
    it('should validate scene with environment context', () => {
      const scene = createSceneWithContext('tense', 'forest');
      const validation = SceneValidator.validateSceneDescriptor(scene);

      expect(validation.isValid).toBe(true);
      expect(validation.metadataComplete).toBe(true);
    });

    it('should handle scenes with all metadata blocks', () => {
      const scene = createSceneWithContext('peaceful', 'village');

      expect(scene.assetHooks.length).toBeGreaterThan(0);
      expect(scene.recommendedChoices.length).toBeGreaterThan(0);
      expect(scene.equipmentHighlights.length).toBeGreaterThan(0);
      expect(scene.diagnostics.appliedRestrictions.length).toBeGreaterThan(0);
    });
  });
});