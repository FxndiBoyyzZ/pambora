// src/ai/flows/pambora-content-generator.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating content ideas for the #PAMBORA social feed.
 *
 * It exports:
 * - `generatePamboraContentIdeas`: An async function that takes a description of recent community activity and returns content ideas.
 * - `PamboraContentIdeasInput`: The input type for the `generatePamboraContentIdeas` function.
 * - `PamboraContentIdeasOutput`: The output type for the `generatePamboraContentIdeas` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PamboraContentIdeasInputSchema = z.object({
  recentActivity: z
    .string()
    .describe(
      'A description of recent activity in the #PAMBORA community feed, e.g. "users are sharing workout progress and recipes".'
    ),
});
export type PamboraContentIdeasInput = z.infer<typeof PamboraContentIdeasInputSchema>;

const PamboraContentIdeasOutputSchema = z.object({
  contentIdeas: z
    .array(z.string())
    .describe('A list of content ideas for the #PAMBORA social feed.'),
});
export type PamboraContentIdeasOutput = z.infer<typeof PamboraContentIdeasOutputSchema>;

export async function generatePamboraContentIdeas(
  input: PamboraContentIdeasInput
): Promise<PamboraContentIdeasOutput> {
  return pamboraContentIdeasFlow(input);
}

const pamboraContentIdeasPrompt = ai.definePrompt({
  name: 'pamboraContentIdeasPrompt',
  input: {schema: PamboraContentIdeasInputSchema},
  output: {schema: PamboraContentIdeasOutputSchema},
  prompt: `You are a social media content creation assistant for the #PAMBORA fitness community.

  Based on the recent community activity, generate a list of content ideas that users can post to the feed to increase engagement.

  Recent Community Activity: {{{recentActivity}}}

  Content Ideas:
  `, // Ensure the output is a list of content ideas
});

const pamboraContentIdeasFlow = ai.defineFlow(
  {
    name: 'pamboraContentIdeasFlow',
    inputSchema: PamboraContentIdeasInputSchema,
    outputSchema: PamboraContentIdeasOutputSchema,
  },
  async input => {
    const {output} = await pamboraContentIdeasPrompt(input);
    return output!;
  }
);
