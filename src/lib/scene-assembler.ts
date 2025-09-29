import { generateSceneFromMoment } from '@/ai/flows/generate-scene-from-moment';
import type { Moment, SceneDescriptor, RuntimeContext } from './types';

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
   * @returns A promise that resolves to the generated SceneDescriptor.
   */
  async buildScene(moment: Moment, context: RuntimeContext): Promise<SceneDescriptor> {
    const sceneInput = {
      momentId: moment.momentId,
      content: moment.content,
      chapterId: context.chapterId,
      arcId: context.arcId,
      partySnapshot: context.partySnapshot,
      environmentState: context.environmentState,
      currentMood: context.currentMood,
    };
    
    const sceneDescriptor = await generateSceneFromMoment(sceneInput);
    
    // The narrative text should be the raw content from the moment, which the AI expands upon.
    // We set it here to ensure it's not just the AI's version.
    // The AI's expansion is still in `sceneDescriptor.narrativeText` but we overwrite it
    // for this implementation.
    sceneDescriptor.narrativeText = moment.content;
    
    return sceneDescriptor;
  }
}
