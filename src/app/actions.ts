'use server';

import { DreamweaverDirector } from '@/lib/dreamweaver-director';
import type { SceneDescriptor, DreamweaverPersonality } from '@/lib/types';
import { reviewScenes } from '@/ai/flows/review-scenes';
import { z } from 'zod';

const generateSceneSchema = z.object({
  storyId: z.string(),
  chapterId: z.string(),
  arcId: z.string(),
  momentId: z.string(),
  restrictions: z.string().optional(),
});

export type GenerateSceneState = {
  data: SceneDescriptor[] | null;
  error: string | null;
};

const reviewSchema = z.object({
  scene1: z.string(),
  scene2: z.string(),
  scene3: z.string(),
});

export type ReviewState = {
  data: string | null;
  error: string | null;
};

const personalities: DreamweaverPersonality[] = ['Luminari', 'Shadow', 'Chronicler'];

export async function generateSceneAction(
  prevState: GenerateSceneState,
  formData: FormData
): Promise<GenerateSceneState> {
  try {
    const parsed = generateSceneSchema.safeParse(Object.fromEntries(formData.entries()));

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

export async function reviewScenesAction(
  prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  try {
    const parsed = reviewSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!parsed.success) {
      return { data: null, error: 'Invalid form data for review.' };
    }
    
    const { scene1, scene2, scene3 } = parsed.data;

    const review = await reviewScenes({
      sceneLuminari: scene1,
      sceneShadow: scene2,
      sceneChronicler: scene3
    });

    return { data: review.review, error: null };

  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred during review.';
    console.error(error);
    return { data: null, error };
  }
}
