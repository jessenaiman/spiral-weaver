'use server';

/**
 * @fileOverview Applies content restrictions to a scene using GenAI, filtering and adapting the content
 *  to align with specified guardrails.
 *
 * - applyRestrictionsToScene - A function that applies content restrictions to a given scene.
 * - ApplyRestrictionsToSceneInput - The input type for the applyRestrictionsToScene function.
 * - ApplyRestrictionsToSceneOutput - The return type for the applyRestrictionsToScene function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the ApplyRestrictionsToScene flow
const ApplyRestrictionsToSceneInputSchema = z.object({
  sceneContent: z.string().describe('The original scene content to be filtered.'),
  restrictions: z.string().describe('The content restrictions or guardrails to apply.'),
});
export type ApplyRestrictionsToSceneInput = z.infer<typeof ApplyRestrictionsToSceneInputSchema>;

// Define the output schema for the ApplyRestrictionsToScene flow
const ApplyRestrictionsToSceneOutputSchema = z.object({
  filteredContent: z.string().describe('The scene content after applying the specified restrictions.'),
});
export type ApplyRestrictionsToSceneOutput = z.infer<typeof ApplyRestrictionsToSceneOutputSchema>;

// Define the main function that will be called to apply restrictions to a scene
export async function applyRestrictionsToScene(
  input: ApplyRestrictionsToSceneInput
): Promise<ApplyRestrictionsToSceneOutput> {
  return applyRestrictionsToSceneFlow(input);
}

// Define the prompt to filter scene content based on the provided restrictions
const applyRestrictionsPrompt = ai.definePrompt({
  name: 'applyRestrictionsPrompt',
  input: {schema: ApplyRestrictionsToSceneInputSchema},
  output: {schema: ApplyRestrictionsToSceneOutputSchema},
  prompt: `You are a content filter that adapts scene content based on specified restrictions.

  Original Scene Content: {{{sceneContent}}}
  Restrictions: {{{restrictions}}}

  Filtered Scene Content:`,
});

// Define the Genkit flow for applying restrictions to the scene content
const applyRestrictionsToSceneFlow = ai.defineFlow(
  {
    name: 'applyRestrictionsToSceneFlow',
    inputSchema: ApplyRestrictionsToSceneInputSchema,
    outputSchema: ApplyRestrictionsToSceneOutputSchema,
  },
  async input => {
    const {output} = await applyRestrictionsPrompt(input);
    return output!;
  }
);
