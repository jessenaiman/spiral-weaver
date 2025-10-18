/**
 * @fileOverview Mood and environment tests validating diagnostics metadata and context integration
 */

import { SceneAssembler } from '@/lib/scene-assembler';
import { ReferenceShelf } from '@/lib/narrative-service';
import { SceneValidator } from '../utils/test-validators';
import type { Moment, RuntimeContext } from '@/lib/types';

describe('Mood and Environment Tests', () => {
  let shelf: ReferenceShelf;
  let assembler: SceneAssembler;
  let testMoment: Moment | undefined;

  beforeEach(async () => {
    shelf = new ReferenceShelf();
    assembler = new SceneAssembler();

    const stories = await shelf.getStories();
    const story = stories[0];

    if (story && story.chapters[0] && story.chapters[0].arcs[0]) {
      testMoment = story.chapters[0].arcs[0].moments[0];
    }
  });

  describe('Mood Metadata', () => {
    it('should reflect mood in scene generation', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const context: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: party,
        environmentState: 'forest',
        currentMood: 'tense',
      };

      const scene = await assembler.buildScene(testMoment, context, 'Luminari');

      expect(scene.mood).toBeDefined();
      expect(scene.mood.trim().length).toBeGreaterThan(0);
    });

    it('should track mood adjustments in diagnostics', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const context: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: party,
        environmentState: 'village',
        currentMood: 'hopeful',
      };

      const scene = await assembler.buildScene(testMoment, context, 'Chronicler');

      expect(scene.diagnostics.moodAdjustments).toBeDefined();
      expect(Array.isArray(scene.diagnostics.moodAdjustments)).toBe(true);
    });

    it('should handle different mood contexts', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const moods = ['tense', 'peaceful', 'mysterious', 'triumphant'];

      for (const mood of moods) {
        const context: RuntimeContext = {
          chapterId: testMoment.chapterId,
          arcId: testMoment.arcId,
          momentId: testMoment.momentId,
          partySnapshot: party,
          environmentState: 'generic',
          currentMood: mood,
        };

        const scene = await assembler.buildScene(testMoment, context, 'Luminari');

        expect(scene.mood).toBeDefined();
        expect(scene.diagnostics.moodAdjustments).toBeDefined();
        expect(Array.isArray(scene.diagnostics.moodAdjustments)).toBe(true);
      }
    });
  });

  describe('Environment State', () => {
    it('should reflect environment in diagnostics', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const context: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: party,
        environmentState: 'dark_dungeon',
        currentMood: 'fearful',
      };

      const scene = await assembler.buildScene(testMoment, context, 'Shadow');

      expect(scene.diagnostics.branchForecast).toBeDefined();
      expect(scene.diagnostics.branchForecast.trim().length).toBeGreaterThan(0);
    });

    it('should handle various environment states', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const environments = ['forest', 'cave', 'village', 'castle', 'ocean'];

      for (const env of environments) {
        const context: RuntimeContext = {
          chapterId: testMoment.chapterId,
          arcId: testMoment.arcId,
          momentId: testMoment.momentId,
          partySnapshot: party,
          environmentState: env,
          currentMood: 'neutral',
        };

        const scene = await assembler.buildScene(testMoment, context, 'Chronicler');

        expect(scene).toBeDefined();
        expect(scene.diagnostics).toBeDefined();
      }
    });

    it('should validate environment integration in asset hooks', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const context: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: party,
        environmentState: 'volcanic_plains',
        currentMood: 'intense',
      };

      const scene = await assembler.buildScene(testMoment, context, 'Shadow');

      expect(scene.assetHooks).toBeDefined();
      expect(Array.isArray(scene.assetHooks)).toBe(true);
    });
  });

  describe('Diagnostics Metadata', () => {
    it('should generate complete diagnostics metadata', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const context: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: party,
        environmentState: 'temple',
        currentMood: 'reverent',
      };

      const scene = await assembler.buildScene(testMoment, context, 'Luminari');
      const validation = SceneValidator.validateSceneDescriptor(scene);

      expect(validation.isValid).toBe(true);
      expect(scene.diagnostics).toBeDefined();
      expect(scene.diagnostics.appliedRestrictions).toBeDefined();
      expect(Array.isArray(scene.diagnostics.appliedRestrictions)).toBe(true);
      expect(scene.diagnostics.moodAdjustments).toBeDefined();
      expect(Array.isArray(scene.diagnostics.moodAdjustments)).toBe(true);
      expect(scene.diagnostics.branchForecast).toBeDefined();
    });

    it('should track applied restrictions in diagnostics', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const context: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: party,
        environmentState: 'restricted_area',
        currentMood: 'cautious',
      };

      const scene = await assembler.buildScene(testMoment, context, 'Chronicler');

      if (scene.diagnostics.appliedRestrictions.length > 0) {
        scene.diagnostics.appliedRestrictions.forEach(restriction => {
          expect(typeof restriction).toBe('string');
          expect(restriction.trim().length).toBeGreaterThan(0);
        });
      }
    });

    it('should generate branch forecast in diagnostics', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const context: RuntimeContext = {
        chapterId: testMoment.chapterId,
        arcId: testMoment.arcId,
        momentId: testMoment.momentId,
        partySnapshot: party,
        environmentState: 'crossroads',
        currentMood: 'uncertain',
      };

      const scene = await assembler.buildScene(testMoment, context, 'Luminari');

      expect(scene.diagnostics.branchForecast).toBeDefined();
      expect(scene.diagnostics.branchForecast.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Extreme Conditions', () => {
    it('should handle extreme mood conditions', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const extremeMoods = ['absolute_despair', 'ecstatic_joy', 'consuming_rage'];

      for (const mood of extremeMoods) {
        const context: RuntimeContext = {
          chapterId: testMoment.chapterId,
          arcId: testMoment.arcId,
          momentId: testMoment.momentId,
          partySnapshot: party,
          environmentState: 'normal',
          currentMood: mood,
        };

        const scene = await assembler.buildScene(testMoment, context, 'Shadow');

        expect(scene).toBeDefined();
        expect(scene.mood).toBeDefined();
      }
    });

    it('should handle extreme environment conditions', async () => {
      if (!testMoment) {
        console.warn('Test skipped: no test moment available');
        return;
      }

      const party = await shelf.snapshotParty();
      const extremeEnvs = ['outer_void', 'primordial_chaos', 'interdimensional_rift'];

      for (const env of extremeEnvs) {
        const context: RuntimeContext = {
          chapterId: testMoment.chapterId,
          arcId: testMoment.arcId,
          momentId: testMoment.momentId,
          partySnapshot: party,
          environmentState: env,
          currentMood: 'normal',
        };

        const scene = await assembler.buildScene(testMoment, context, 'Chronicler');

        expect(scene).toBeDefined();
        expect(scene.diagnostics).toBeDefined();
      }
    });
  });
});