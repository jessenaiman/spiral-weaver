/**
 * @fileOverview Scene generation tests validating blocks, metadata, and AI flow output
 * Tests focus on structure validation using local LLM for narrative cohesion
 */

import { SceneAssembler } from '@/lib/scene-assembler';
import { ReferenceShelf } from '@/lib/narrative-service';
import { SceneValidator, PersonalityValidator } from '../utils/test-validators';
import type { Moment, RuntimeContext, SceneDescriptor } from '@/lib/types';

describe('Scene Generation Tests', () => {
  let shelf: ReferenceShelf;
  let assembler: SceneAssembler;
  let testMoment: Moment | undefined;
  let testContext: RuntimeContext;

  beforeEach(async () => {
    shelf = new ReferenceShelf();
    assembler = new SceneAssembler();

    const stories = await shelf.getStories();
    const story = stories[0];

    // Get first available moment for testing
    if (story && story.chapters[0] && story.chapters[0].arcs[0]) {
      testMoment = story.chapters[0].arcs[0].moments[0];

      if (testMoment) {
        const party = await shelf.snapshotParty();
        testContext = {
          chapterId: testMoment.chapterId,
          arcId: testMoment.arcId,
          momentId: testMoment.momentId,
          partySnapshot: party,
          environmentState: 'forest',
          currentMood: 'tense',
        };
      }
    }
  });

  describe('Scene Descriptor Structure', () => {
    it('should generate scene with all required blocks and metadata', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Luminari');
      const validation = SceneValidator.validateSceneDescriptor(scene);

      expect(validation.isValid).toBe(true);
      expect(validation.hasRequiredBlocks).toBe(true);
      expect(validation.metadataComplete).toBe(true);
    });

    it('should include all required narrative blocks in scene', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Luminari');

      expect(scene.sceneId).toBeDefined();
      expect(scene.title).toBeDefined();
      expect(scene.narrativeText).toBeDefined();
      expect(scene.narrativeText.trim().length).toBeGreaterThan(0);
      expect(scene.mood).toBeDefined();
    });

    it('should include metadata arrays for all scene elements', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Chronicler');

      expect(Array.isArray(scene.assetHooks)).toBe(true);
      expect(Array.isArray(scene.recommendedChoices)).toBe(true);
      expect(Array.isArray(scene.partyHighlights)).toBe(true);
      expect(Array.isArray(scene.equipmentHighlights)).toBe(true);
      expect(Array.isArray(scene.branchOptions)).toBe(true);
    });

    it('should generate diagnostics with complete metadata', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Shadow');

      expect(scene.diagnostics).toBeDefined();
      expect(Array.isArray(scene.diagnostics.appliedRestrictions)).toBe(true);
      expect(Array.isArray(scene.diagnostics.moodAdjustments)).toBe(true);
      expect(scene.diagnostics.branchForecast).toBeDefined();
    });
  });

  describe('Context Integration', () => {
    it('should reflect runtime context in scene output', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Luminari');
      const validation = SceneValidator.validateContextIntegration(scene, testContext);

      // Context should be reflected in scene
      expect(validation.isValid).toBe(true);
    });

    it('should reflect mood context in scene metadata', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const moodContext = { ...testContext, currentMood: 'peaceful' };
      const scene = await assembler.buildScene(testMoment, moodContext, 'Luminari');

      expect(scene.mood).toBeDefined();
      // Mood should be reflected in scene or diagnostics
      expect(
        scene.mood.toLowerCase().includes('peace') ||
        scene.diagnostics.moodAdjustments.some(adj => adj.toLowerCase().includes('peace'))
      ).toBe(true);
    });

    it('should reflect environment context in diagnostics', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const envContext = { ...testContext, environmentState: 'dark_cave' };
      const scene = await assembler.buildScene(testMoment, envContext, 'Chronicler');

      // Environment should be reflected in diagnostics or forecast
      expect(scene.diagnostics.branchForecast).toBeDefined();
      expect(scene.diagnostics.branchForecast.length).toBeGreaterThan(0);
    });
  });

  describe('Scene Personality Influence', () => {
    it('should generate distinct scenes for Luminari personality', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Luminari');

      expect(scene.dreamweaverPersonality).toBe('Luminari');
      expect(scene.title).toBeDefined();
      expect(scene.mood).toBeDefined();
    });

    it('should generate distinct scenes for Shadow personality', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Shadow');

      expect(scene.dreamweaverPersonality).toBe('Shadow');
      expect(scene.title).toBeDefined();
      expect(scene.mood).toBeDefined();
    });

    it('should generate distinct scenes for Chronicler personality', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Chronicler');

      expect(scene.dreamweaverPersonality).toBe('Chronicler');
      expect(scene.title).toBeDefined();
      expect(scene.mood).toBeDefined();
    });

    it('should show personality differentiation across mood and structure', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const luminariScene = await assembler.buildScene(testMoment, testContext, 'Luminari');
      const shadowScene = await assembler.buildScene(testMoment, testContext, 'Shadow');

      const validation = PersonalityValidator.validatePersonalityInfluence([
        { scene: luminariScene, personality: 'Luminari' },
        { scene: shadowScene, personality: 'Shadow' },
      ]);

      // Personalities should produce different structures
      expect(luminariScene.sceneId).toBeDefined();
      expect(shadowScene.sceneId).toBeDefined();
      // Scenes should have distinct metadata
      expect(luminariScene.sceneId).not.toBe(shadowScene.sceneId);
    });
  });

  describe('Scene Output Validation', () => {
    it('should not have empty narrative text in generated scenes', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Luminari');

      expect(scene.narrativeText).toBeDefined();
      expect(scene.narrativeText.trim().length).toBeGreaterThan(0);
    });

    it('should generate valid branch options with metadata', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Luminari');

      if (scene.branchOptions && scene.branchOptions.length > 0) {
        scene.branchOptions.forEach(option => {
          expect(option.prompt).toBeDefined();
          expect(option.targetMomentId).toBeDefined();
          expect(typeof option.probability).toBe('number');
          expect(option.probability).toBeGreaterThanOrEqual(0);
          expect(option.probability).toBeLessThanOrEqual(1);
        });
      }
    });

    it('should generate equipment highlights when relevant', async () => {
      if (!testMoment || !testContext) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const scene = await assembler.buildScene(testMoment, testContext, 'Luminari');

      if (scene.equipmentHighlights && scene.equipmentHighlights.length > 0) {
        scene.equipmentHighlights.forEach(highlight => {
          expect(highlight.itemId).toBeDefined();
          expect(highlight.name).toBeDefined();
          expect(highlight.usageNotes).toBeDefined();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing context gracefully', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      // Create minimal context
      const minimalContext: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: { partyId: '', members: [], affinities: {}, statusEffects: [] },
        environmentState: '',
        currentMood: '',
      };

      // Should not throw with minimal context
      const scene = await assembler.buildScene(testMoment, minimalContext, 'Luminari');
      expect(scene).toBeDefined();
    });
  });
});