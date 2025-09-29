'use server';

/**
 * @fileOverview Generates a SceneDescriptor from a selected Moment, enriching it with runtime context using GenAI.
 *
 * - generateSceneFromMoment - A function that handles the scene generation process.
 * - GenerateSceneFromMomentInput - The input type for the generateSceneFromMoment function.
 * - GenerateSceneFromMomentOutput - The return type for the generateSceneFromMoment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSceneFromMomentInputSchema = z.object({
  momentId: z.string().describe('The ID of the moment to generate the scene from.'),
  chapterId: z.string().describe('The ID of the chapter the moment belongs to.'),
  arcId: z.string().describe('The ID of the arc the moment belongs to.'),
  partySnapshot: z
    .any()
    .describe('A snapshot of the current party, including members and status.'),
  environmentState: z.string().describe('The current state of the environment.'),
  currentMood: z.string().describe('The current mood or emotional tone.'),
});
export type GenerateSceneFromMomentInput = z.infer<
  typeof GenerateSceneFromMomentInputSchema
>;

const EquipmentHighlightSchema = z.object({
  itemId: z.string().describe('The unique ID of the equipment item.'),
  name: z.string().describe('The name of the equipment item.'),
  usageNotes: z.string().describe('Notes on how the equipment is being used or is relevant in the scene.'),
});

const BranchOptionSchema = z.object({
  prompt: z.string(),
  targetMomentId: z.string(),
  probability: z.number(),
  restrictionNotes: z.string().optional(),
});

const SceneDiagnosticsSchema = z.object({
  appliedRestrictions: z.array(z.string()),
  moodAdjustments: z.array(z.string()),
  branchForecast: z.string(),
});

const GenerateSceneFromMomentOutputSchema = z.object({
  sceneId: z.string().describe('The unique ID of the generated scene.'),
  title: z.string().describe('The title of the scene.'),
  narrativeText: z.string().describe('The narrative text describing the scene.'),
  mood: z.string().describe('The overall mood or atmosphere of the scene.'),
  assetHooks: z.array(z.string()).describe('A list of asset keys required for the scene.'),
  recommendedChoices: z
    .array(z.string())
    .describe('A list of recommended choices or actions for the user.'),
  partyHighlights: z
    .array(z.string())
    .describe('A list of highlights or notes about the current party.'),
  equipmentHighlights: z
    .array(EquipmentHighlightSchema)
    .describe('A list of highlights or notes about the equipment.'),
  branchOptions: z.array(BranchOptionSchema).describe('A list of branching options for the scene.'),
  diagnostics: SceneDiagnosticsSchema
    .describe('A diagnostics panel summarizing applied restrictions, mood adjustments, and branching probabilities.'),
});
export type GenerateSceneFromMomentOutput = z.infer<
  typeof GenerateSceneFromMomentOutputSchema
>;

export async function generateSceneFromMoment(
  input: GenerateSceneFromMomentInput
): Promise<GenerateSceneFromMomentOutput> {
  return generateSceneFromMomentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSceneFromMomentPrompt',
  input: {schema: GenerateSceneFromMomentInputSchema},
  output: {schema: GenerateSceneFromMomentOutputSchema},
  prompt: `You are a scene generator for a narrative adventure game.  You will be provided the current game context, and must weave a scene that is appropriate.

Game Context:
Chapter Id: {{{chapterId}}}
Arc Id: {{{arcId}}}
Moment Id: {{{momentId}}}
Party Snapshot: {{{partySnapshot}}}
Environment State: {{{environmentState}}}
Current Mood: {{{currentMood}}}

Create a vivid and dynamic narrative scene that enriches the selected Moment with the provided runtime context. Consider the characters, equipment, and overall mood to generate compelling narrative text, asset hooks, and branching options.

Output a JSON object conforming to the following schema: {{$instructions}}`,
});

const generateSceneFromMomentFlow = ai.defineFlow(
  {
    name: 'generateSceneFromMomentFlow',
    inputSchema: GenerateSceneFromMomentInputSchema,
    outputSchema: GenerateSceneFromMomentOutputSchema,
  },
  async input => {
    // For testing purposes, return a static response for a specific moment.
    if (input.momentId === 'm-1-1-1') {
      return {
        sceneId: `scene-${Date.now()}`,
        title: 'The Compass Awakens (Static)',
        narrativeText:
          'The crackle of the campfire is the only sound, a stark contrast to the oppressive silence of the Veridian Forest. Elara pores over a crumbling map, Bram sharpens his axe, and Lyra seems to melt into the shadows. Suddenly, the old compass on a nearby rock hums, emitting a soft, ethereal glow. A ghostly needle of light stabs northward into the pitch-black woods, promising an unknown path.',
        mood: 'Anticipation and Mystery',
        assetHooks: ['asset-forest-night', 'asset-campfire-crackle'],
        recommendedChoices: ['Examine the compass', 'Ready the party to leave'],
        partyHighlights: [
          'Elara is focused on her research.',
          'Bram is preparing for a potential fight.',
        ],
        equipmentHighlights: [
          {
            itemId: 'equip-01',
            name: 'Whispering Compass',
            usageNotes: 'The compass has activated on its own, pointing north.',
          },
        ],
        branchOptions: [
          {
            prompt: 'Follow the light immediately.',
            targetMomentId: 'm-1-1-2',
            probability: 0.8,
            restrictionNotes: 'Proceeds the main quest.',
          },
        ],
        diagnostics: {
          appliedRestrictions: ['Initial moment, no restrictions applied.'],
          moodAdjustments: ['Mood set to "Anticipation" based on context.'],
          branchForecast: 'High probability of proceeding to "The First Step".',
        },
      };
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
