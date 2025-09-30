'use server';

import { DreamweaverDirector } from '@/lib/dreamweaver-director';
import type { SceneDescriptor } from '@/lib/types';
import { z } from 'zod';

const formSchema = z.object({
  storyId: z.string(),
  chapterId: z.string(),
  arcId: z.string(),
  momentId: z.string(),
  restrictions: z.string().optional(),
  dreamweaver: z.enum(['Luminari', 'Shadow', 'Chronicler']),
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
    
    const { storyId, chapterId, arcId, momentId, restrictions, dreamweaver } = parsed.data;

    // The Director is now the single entry point for scene generation
    const director = new DreamweaverDirector();

    const sceneDescriptor = await director.generateScene(storyId, chapterId, arcId, momentId, dreamweaver, restrictions);
    
    return { data: sceneDescriptor, error: null };

  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error(error);
    return { data: null, error };
  }
}
