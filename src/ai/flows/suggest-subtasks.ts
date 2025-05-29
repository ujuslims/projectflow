
// src/ai/flows/suggest-subtasks.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting subtasks based on a project's scope of work,
 * with a focus on industries like topographic survey, geotechnical, geophysical, geospatial, construction,
 * and reality scanning.
 *
 * The flow takes a project's scope of work as input and returns a list of suggested subtasks.
 * @module suggest-subtasks
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSubtasksInputSchema = z.object({
  projectDescription: z.string().describe("A detailed scope of work for the project."), // Changed description to reflect Scope of Work
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
Based on the following project scope of work, suggest a list of subtasks that would be necessary to complete the project.
Consider common project phases such as planning, site assessment, fieldwork/data acquisition, data processing, analysis, reporting, and deliverables.
Return the subtasks as a JSON array of strings.

Project Scope of Work: {{{projectDescription}}}

Subtasks:`, // Updated "Project Description" to "Project Scope of Work" in the prompt
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
