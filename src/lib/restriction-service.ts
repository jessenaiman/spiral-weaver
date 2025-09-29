import { applyRestrictionsToScene } from '@/ai/flows/apply-restrictions-to-scene';
import type { Moment } from './types';

/**
 * The RestrictionService is responsible for applying content guardrails to
 * a generated scene. It uses an AI flow to filter and adapt the narrative text.
 */
export class RestrictionService {
  /**
   * Applies restrictions to the given scene content.
   * @param sceneContent The original narrative text of the scene.
   * @param moment The Moment object, which may contain built-in restriction tags.
   * @param userRestrictions Optional user-provided restrictions.
   * @returns A promise that resolves to the filtered content and a list of applied restrictions.
   */
  async applyRestrictions(
    sceneContent: string,
    moment: Moment,
    userRestrictions?: string
  ): Promise<{ filteredContent: string; appliedRestrictions: string[] }> {
    
    const restrictionInput = {
      sceneContent,
      moment, // Pass the full moment
      userRestrictions,
    };
    
    const filteredResult = await applyRestrictionsToScene(restrictionInput);
    
    return filteredResult;
  }
}
