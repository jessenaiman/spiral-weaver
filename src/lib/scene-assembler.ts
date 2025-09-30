import { generateSceneFromMoment } from '@/ai/flows/generate-scene-from-moment';
import type { Moment, SceneDescriptor, RuntimeContext, DreamweaverPersonality } from './types';

/**
 * The SceneAssembler is responsible for building a SceneDescriptor from a Moment
 * and the current runtime context. It uses an AI flow to generate the initial
 * narrative and details.
 */
export class SceneAssembler {
  /**
   * Constructs a scene by calling the AI scene generation flow.
   * @param moment The narrative Moment to base the scene on.
   * @param context The current runtime context of the game.
   * @param dreamweaverPersonality The selected storyteller personality.
   * @returns A promise that resolves to the generated SceneDescriptor.
   */
  async buildScene(moment: Moment, context: RuntimeContext, dreamweaverPersonality: DreamweaverPersonality): Promise<SceneDescriptor> {
    const sceneInput = {
      momentId: moment.momentId,
      content: moment.content,
      chapterId: context.chapterId,
      arcId: context.arcId,
      partySnapshot: context.partySnapshot,
      environmentState: context.environmentState,
      currentMood: context.currentMood,
      dreamweaverPersonality: dreamweaverPersonality,
    };
    
    const sceneDescriptor = await generateSceneFromMoment(sceneInput);
    
    return sceneDescriptor;
  }
}
