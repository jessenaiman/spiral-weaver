'use server';

import { generateSceneFromMoment } from '@/ai/flows/generate-scene-from-moment';
import { applyRestrictionsToScene } from '@/ai/flows/apply-restrictions-to-scene';
import { ReferenceShelf } from '@/lib/narrative-service';
import type { SceneDescriptor } from '@/lib/types';
import { z } from 'zod';

const formSchema = z.object({
  storyId: z.string(),
  chapterId: z.string(),
  arcId: z.string(),
  momentId: z.string(),
  restrictions: z.string().optional(),
});

export type FormState = {
  data: SceneDescriptor | null;
  error: string | null;
};

export async function generateSceneAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const parsed = formSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { data: null, error: 'Invalid form data.' };
    }
    
    const { storyId, chapterId, arcId, momentId, restrictions } = parsed.data;

    const referenceShelf = new ReferenceShelf();
    const partySnapshot = await referenceShelf.snapshotParty();
    const moment = await referenceShelf.getMoment(storyId, chapterId, arcId, momentId);

    if (!moment) {
      return { data: null, error: 'Selected moment not found.' };
    }
    
    // Step 1: Generate the initial scene from the moment and runtime context.
    const sceneInput = {
      momentId: moment.momentId,
      chapterId,
      arcId,
      partySnapshot,
      environmentState: "Calm, early evening",
      currentMood: "Anticipation",
    };
    
    let sceneDescriptor = await generateSceneFromMoment(sceneInput);

    // Step 2: If restrictions are provided, apply them to the generated scene.
    if (restrictions) {
      const restrictionInput = {
        sceneContent: sceneDescriptor.narrativeText,
        restrictions: restrictions,
      };
      
      const filteredResult = await applyRestrictionsToScene(restrictionInput);
      
      // Update the scene with the filtered content and add to diagnostics
      sceneDescriptor.narrativeText = filteredResult.filteredContent;
      sceneDescriptor.diagnostics.appliedRestrictions = [
        ...(sceneDescriptor.diagnostics.appliedRestrictions || []), 
        `User-defined: "${restrictions}"`
      ];
    }
    
    return { data: sceneDescriptor, error: null };

  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error(error);
    return { data: null, error };
  }
}
