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
import { Moment } from '@/lib/types';
import {z} from 'genkit';

// Define the input schema for the ApplyRestrictionsToScene flow
const ApplyRestrictionsToSceneInputSchema = z.object({
  sceneContent: z.string().describe('The original scene content to be filtered.'),
  moment: z.any().describe('The Moment object containing restriction tags.'),
  userRestrictions: z.string().optional().describe('User-provided content restrictions or guardrails to apply.'),
});
export type ApplyRestrictionsToSceneInput = z.infer<typeof ApplyRestrictionsToSceneInputSchema>;

// Define the output schema for the ApplyRestrictionsToScene flow
const ApplyRestrictionsToSceneOutputSchema = z.object({
  filteredContent: z.string().describe('The scene content after applying the specified restrictions.'),
  appliedRestrictions: z.array(z.string()).describe('A list of all restrictions that were applied.'),
});
export type ApplyRestrictionsToSceneOutput = z.infer<typeof ApplyRestrictionsToSceneOutputSchema>;

// Define the main function that will be called to apply restrictions to a scene
export async function applyRestrictionsToScene(
  input: ApplyRestrictionsToSceneInput
): Promise<ApplyRestrictionsToSceneOutput> {
  return applyRestrictionsToSceneFlow(input);
}

// Define the Genkit flow for applying restrictions to the scene content
const applyRestrictionsToSceneFlow = ai.defineFlow(
  {
    name: 'applyRestrictionsToSceneFlow',
    inputSchema: ApplyRestrictionsToSceneInputSchema,
    outputSchema: ApplyRestrictionsToSceneOutputSchema,
  },
  async ({ sceneContent, moment, userRestrictions }) => {
    const momentTyped = moment as Moment;
    const allRestrictions = [...(momentTyped.restrictionTags || [])];
    if (userRestrictions) {
      allRestrictions.push(`User-defined: "${userRestrictions}"`);
    }

    if (allRestrictions.length === 0) {
      return {
        filteredContent: sceneContent,
        appliedRestrictions: ['No restrictions applied.'],
      };
    }

    const result = await ai.generate({
      prompt: `You are a content filter. Adapt the following scene content to adhere to the specified restrictions.
  
      Original Scene Content:
      "${sceneContent}"
      
      Restrictions to Apply:
      - ${allRestrictions.join('\n- ')}
      
      Rewrite the scene content to comply with all restrictions. Do not mention the restrictions in your output. Just provide the filtered content.
      
      Filtered Scene Content:`,
      model: 'googleai/gemini-2.5-flash',
    });

    return {
      filteredContent: result.text,
      appliedRestrictions: allRestrictions,
    };
  }
);
