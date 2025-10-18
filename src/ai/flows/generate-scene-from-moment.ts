'use server';

/**
 * @fileOverview Generates a SceneDescriptor from a selected Moment, using a specific Dreamweaver personality
 * to guide the storytelling.
 *
 * - generateSceneFromMoment - A function that handles the scene generation process.
 * - GenerateSceneFromMomentInput - The input type for the generateSceneFromMoment function.
 * - GenerateSceneFromMomentOutput - The return type for the generateSceneFromMoment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { agentSystem } from '@/ai/qwen-agents';

const GenerateSceneFromMomentInputSchema = z.object({
  momentId: z.string().describe('The ID of the moment to generate the scene from.'),
  content: z.string().describe('The core narrative content of the moment.'),
  chapterId: z.string().describe('The ID of the chapter the moment belongs to.'),
  arcId: z.string().describe('The ID of the arc the moment belongs to.'),
  partySnapshot: z
    .any()
    .describe('A snapshot of the current party, including members and status.'),
  environmentState: z.string().describe('The current state of the environment.'),
  currentMood: z.string().describe('The current mood or emotional tone.'),
  dreamweaverPersonality: z.enum(['Luminari', 'Shadow', 'Chronicler']).describe('The selected Dreamweaver personality (good, evil, neutral).')
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
  title: z.string().describe('The title of the scene, reflecting the personality of the Dreamweaver.'),
  narrativeText: z.string().describe('The newly generated narrative text, continuing from the moment\'s content and guided by the Dreamweaver\'s personality.'),
  mood: z.string().describe('The overall mood or atmosphere of the scene, influenced by the Dreamweaver.'),
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
  try {
    // First, generate the base scene using the original flow
    const baseScene = await generateSceneFromMomentFlow(input);

    // Then, enhance it using the Qwen agent collaboration system
    const enhancedResult = await agentSystem.generateEnhancedScene({
      baseScene,
      input,
      enhancementLevel: 'standard'
    });

    // Merge the enhanced content back into the original schema format
    const finalScene: GenerateSceneFromMomentOutput = {
      ...baseScene,
      // Add quality enhancements from agents
      narrativeText: enhancedResult.enhancedScene.narrativeText || baseScene.narrativeText,
      diagnostics: {
        ...baseScene.diagnostics,
        agentEnhancements: {
          qualityScore: enhancedResult.enhancedScene.qualityScore,
          improvements: enhancedResult.enhancedScene.improvements,
          validationPassed: enhancedResult.enhancedScene.validationPassed,
          moodAnalysis: enhancedResult.analysis.moodAnalysis,
          suggestions: enhancedResult.analysis.suggestions
        }
      }
    };

    return finalScene;
  } catch (error) {
    console.error('Error in enhanced scene generation:', error);
    // Fallback to original flow if agent system fails
    return generateSceneFromMomentFlow(input);
  }
}

const prompt = ai.definePrompt({
  name: 'generateSceneFromMomentPrompt',
  input: {schema: GenerateSceneFromMomentInputSchema},
  output: {schema: GenerateSceneFromMomentOutputSchema},
  prompt: `You are a Dreamweaver, a powerful AI storyteller for a narrative adventure game. Your task is to generate a new narrative scene that logically follows from a given "moment". You must adopt a specific personality to guide your storytelling.

The Dreamweaver Personalities:
- **Luminari (Good):** You are a hopeful and benevolent storyteller. Your narratives focus on heroism, light, redemption, and the better aspects of nature and character. You create scenes that inspire and offer paths toward positive outcomes.
- **Shadow (Evil):** You are a dark and malevolent storyteller. Your narratives embrace conflict, despair, corruption, and the grim realities of the world. You create scenes that challenge, threaten, and explore the darker aspects of the story and characters.
- **Chronicler (Neutral):** You are an objective and balanced storyteller. Your narratives are factual, descriptive, and unbiased. You present events as they are, focusing on cause and effect without favoring light or shadow.

**Your current personality is: {{{dreamweaverPersonality}}}**

The player has selected the following narrative moment to continue from:
"{{{content}}}"

This content is the starting point. Your main task is to generate a **new narrative element** that logically continues the story, seen through the lens of your assigned personality.

Game Context to inform your generation:
- Chapter ID: {{{chapterId}}}
- Arc ID: {{{arcId}}}
- Moment ID: {{{momentId}}}
- Party Snapshot: {{{partySnapshot}}}
- Environment: {{{environmentState}}}
- Current Mood: {{{currentMood}}}

Based on your personality and the provided context, generate a compelling new scene. Create a new title, narrative text, and other details that reflect your unique perspective as the Dreamweaver.

Output a JSON object conforming to the following schema: {{$instructions}}`,
});

const generateSceneFromMomentFlow = ai.defineFlow(
  {
    name: 'generateSceneFromMomentFlow',
    inputSchema: GenerateSceneFromMomentInputSchema,
    outputSchema: GenerateSceneFromMomentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
