'use server';

import { generateSceneFromMoment } from '@/ai/flows/generate-scene-from-moment';
import { applyRestrictionsToScene } from '@/ai/flows/apply-restrictions-to-scene';
import { DreamweaverDirector } from '@/lib/dreamweaver-director';
import type { SceneDescriptor } from '@/lib/types';
import { z } from 'zod';
import { NarrativeJournal } from '@/lib/narrative-journal';

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

    const director = new DreamweaverDirector();
    const journal = new NarrativeJournal();

    const moment = await director.referenceShelf.getMoment(storyId, chapterId, arcId, momentId);

    if (!moment) {
      return { data: null, error: 'Selected moment not found.' };
    }
    
    // Step 1: Generate the initial scene from the moment and runtime context.
    const partySnapshot = await director.referenceShelf.snapshotParty();
    const sceneInput = {
      momentId: moment.momentId,
      content: moment.content,
      chapterId,
      arcId,
      partySnapshot,
      environmentState: "Calm, early evening",
      currentMood: director.moodEngine.getCurrentMood(),
    };
    
    let sceneDescriptor = await generateSceneFromMoment(sceneInput);

    // Step 2: Apply restrictions (both built-in and user-defined)
    const restrictionInput = {
      sceneContent: sceneDescriptor.narrativeText,
      moment, // Pass the full moment
      userRestrictions: restrictions,
    };
    
    const filteredResult = await applyRestrictionsToScene(restrictionInput);
    
    // Update the scene with the filtered content and add to diagnostics
    sceneDescriptor.narrativeText = filteredResult.filteredContent;
    sceneDescriptor.diagnostics.appliedRestrictions = filteredResult.appliedRestrictions;

    // Step 3: Log the scene to the journal
    journal.logScene(sceneDescriptor);
    
    return { data: sceneDescriptor, error: null };

  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error(error);
    return { data: null, error };
  }
}
