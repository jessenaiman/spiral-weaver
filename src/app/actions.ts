'use server';

import { DreamweaverDirector } from '@/lib/dreamweaver-director';
import type { SceneDescriptor, DreamweaverPersonality } from '@/lib/types';
import { z } from 'zod';

const formSchema = z.object({
  storyId: z.string(),
  chapterId: z.string(),
  arcId: z.string(),
  momentId: z.string(),
  restrictions: z.string().optional(),
});

export type FormState = {
  data: SceneDescriptor[] | null;
  error: string | null;
};

const personalities: DreamweaverPersonality[] = ['Luminari', 'Shadow', 'Chronicler'];

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

    // Generate all three scenes in parallel
    const scenePromises = personalities.map(personality => 
      director.generateScene(storyId, chapterId, arcId, momentId, personality, restrictions)
    );

    const sceneDescriptors = await Promise.all(scenePromises);
    
    return { data: sceneDescriptors, error: null };

  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error(error);
    return { data: null, error };
  }
}
