'use server';

import { DreamweaverDirector } from '@/lib/dreamweaver-director';
import type { SceneDescriptor, DreamweaverPersonality, Moment } from '@/lib/types';
import { reviewScenes } from '@/ai/flows/review-scenes';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { ReferenceShelf } from '@/lib/narrative-service';

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
  isLoadedFromSave?: boolean;
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

const saveScenesSchema = z.object({
    momentId: z.string(),
    scenes: z.string(),
});

export type SaveScenesState = {
    message: string | null;
    error: string | null;
}

const saveNarrativeContentSchema = z.object({
    storyId: z.string(),
    chapterId: z.string(),
    arcId: z.string(),
    momentId: z.string(),
    type: z.enum(['moment', 'arc', 'chapter', 'story']),
    content: z.string().optional(),
    title: z.string().optional(),
    theme: z.string().optional(),
    synopsis: z.string().optional(),
    summary: z.string().optional(),
    timeline: z.string().optional(),
    themes: z.string().optional(),
    lore: z.string().optional(),
    subtext: z.string().optional(),
});

export type SaveNarrativeContentState = {
    message: string | null;
    error: string | null;
}

const personalities: DreamweaverPersonality[] = ['Luminari', 'Shadow', 'Chronicler'];
const savedScenesPath = path.resolve(process.cwd(), 'src/lib/data/saved-scenes.json');

async function getSavedScenes(): Promise<Record<string, SceneDescriptor[]>> {
    try {
        const fileContent = await fs.readFile(savedScenesPath, 'utf-8');
        return JSON.parse(fileContent);
    } catch {
        // If file doesn't exist or is invalid JSON, return empty object
        return {};
    }
}


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

    // Check if scenes are already saved
    const savedScenes = await getSavedScenes();
    if (savedScenes && typeof savedScenes === 'object' && savedScenes.hasOwnProperty(momentId)) {
      return { data: savedScenes[momentId], error: null, isLoadedFromSave: true };
    }

    // Generate all three scenes in parallel
    const scenePromises = personalities.map(personality => 
      director.generateScene(storyId, chapterId, arcId, momentId, personality, restrictions)
    );

    const sceneDescriptors = await Promise.all(scenePromises);
    
    return { data: sceneDescriptors, error: null, isLoadedFromSave: false };

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

export async function saveScenesAction(
    prevState: SaveScenesState,
    formData: FormData
): Promise<SaveScenesState> {
    try {
        const parsed = saveScenesSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!parsed.success) {
            return { message: null, error: 'Invalid data for saving scenes.' };
        }

        const { momentId, scenes: scenesString } = parsed.data;
        const scenesToSave: SceneDescriptor[] = JSON.parse(scenesString);

        const savedScenes = await getSavedScenes();
        savedScenes[momentId] = scenesToSave;

        await fs.writeFile(savedScenesPath, JSON.stringify(savedScenes, null, 2), 'utf-8');

        return { message: 'Scenes saved successfully!', error: null };
    } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred during save.';
        console.error(error);
        return { message: null, error };
    }
}

export async function saveNarrativeContentAction(
    prevState: SaveNarrativeContentState,
    formData: FormData
): Promise<SaveNarrativeContentState> {
    try {
        const parsed = saveNarrativeContentSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!parsed.success) {
            return { message: null, error: 'Invalid data for saving narrative content.' };
        }

        const { storyId, chapterId, arcId, momentId, type, content, title, theme, synopsis, summary, timeline, themes, lore, subtext } = parsed.data;

        // Save the updated content based on type
        const referenceShelf = new ReferenceShelf();
        let success = false;

        switch (type) {
            case 'moment':
                // Create updates object for Moment
                const momentUpdates: Partial<Moment> = {};
                if (content !== undefined) momentUpdates.content = content;
                if (title !== undefined) momentUpdates.title = title;
                if (timeline !== undefined) momentUpdates.timeline = JSON.parse(timeline);
                if (themes !== undefined) momentUpdates.themes = JSON.parse(themes);
                if (lore !== undefined) momentUpdates.lore = JSON.parse(lore);
                if (subtext !== undefined) momentUpdates.subtext = JSON.parse(subtext);
                
                success = await referenceShelf.saveNarrativeContent(storyId, chapterId, arcId, momentId, momentUpdates);
                break;
            default:
                // For now, we only handle moment updates
                success = await referenceShelf.saveNarrativeContent(storyId, chapterId, arcId, momentId, {});
        }

        if (success) {
            return { message: 'Narrative content saved successfully!', error: null };
        } else {
            return { message: null, error: 'Failed to save narrative content.' };
        }
    } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred during save.';
        console.error(error);
        return { message: null, error };
    }
}
