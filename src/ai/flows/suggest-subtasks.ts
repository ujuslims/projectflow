
// src/ai/flows/suggest-subtasks.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting subtasks based on a project's scope of work,
 * with a focus on industries like topographic survey, geotechnical, geophysical, geospatial, construction,
 * and reality scanning.
 *
 * The flow can optionally target suggestions for a specific project stage.
 * @module suggest-subtasks
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSubtasksInputSchema = z.object({
  projectDescription: z.string().describe("A detailed scope of work for the project."),
  targetStageName: z.string().optional().describe('The specific project stage for which to suggest subtasks. If omitted, general subtasks for the project will be suggested.'),
});

export type SuggestSubtasksInput = z.infer<typeof SuggestSubtasksInputSchema>;

const SuggestSubtasksOutputSchema = z.object({
  subtasks: z.array(
    z.string().describe('A suggested subtask for the project.')
  ).describe('A list of suggested subtasks for the project.'),
});

export type SuggestSubtasksOutput = z.infer<typeof SuggestSubtasksOutputSchema>;


export async function suggestSubtasks(input: SuggestSubtasksInput): Promise<SuggestSubtasksOutput> {
  return suggestSubtasksFlow(input);
}

const suggestSubtasksPrompt = ai.definePrompt({
  name: 'suggestSubtasksPrompt',
  input: {schema: SuggestSubtasksInputSchema},
  output: {schema: SuggestSubtasksOutputSchema},
  prompt: `You are an expert project planner specializing in industries like topographic survey, geotechnical, geophysical, geospatial, construction, and reality scanning.
Based on the following project scope of work: {{{projectDescription}}}

{{#if targetStageName}}
Focus on suggesting subtasks that are relevant to the "{{targetStageName}}" stage of such a project.
{{else}}
Suggest a general list of subtasks that would be necessary to complete the project.
{{/if}}

Consider common project phases such as planning, site assessment, fieldwork/data acquisition, data processing, analysis, reporting, and deliverables.
Your response MUST be a JSON object with a single key "subtasks". The value of "subtasks" MUST be an array of strings, where each string is a suggested subtask.
Example format: {"subtasks": ["Develop project charter", "Conduct site visit", "Analyze collected data"]}
`,
});

const suggestSubtasksFlow = ai.defineFlow(
  {
    name: 'suggestSubtasksFlow',
    inputSchema: SuggestSubtasksInputSchema,
    outputSchema: SuggestSubtasksOutputSchema,
  },
  async input => {
    const {output} = await suggestSubtasksPrompt(input);
    return output!;
  }
);

