
'use server';

/**
 * @fileOverview AI agent that suggests subtask organization and deadlines for project planning.
 *
 * - organizeSubtasks - A function that organizes subtasks by stage and suggests deadlines.
 * - OrganizeSubtasksInput - The input type for the organizeSubtasks function.
 * - OrganizeSubtasksOutput - The return type for the organizeSubtasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrganizeSubtasksInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  stages: z.array(z.string()).describe('The different stages of the project.'),
  subtasks: z.array(
    z.object({
      name: z.string().describe('The name of the subtask.'),
      description: z.string().optional().describe('A description of the subtask.'),
    })
  ).describe('A list of subtasks to be organized.'),
});

export type OrganizeSubtasksInput = z.infer<typeof OrganizeSubtasksInputSchema>;

const OrganizeSubtasksOutputSchema = z.object({
  categorizedSubtasks: z.record(
    z.string(),
    z.array(
      z.object({
        name: z.string().describe('The name of the subtask.'),
        description: z.string().optional().describe('A description of the subtask.'),
        endDate: z.string().optional().describe('A suggested end date for the subtask (ISO format).'), // RENAMED from suggestedDeadline
      })
    )
  ).describe('Subtasks categorized by stage, with suggested end dates.'), // UPDATED description
});

export type OrganizeSubtasksOutput = z.infer<typeof OrganizeSubtasksOutputSchema>;

export async function organizeSubtasks(input: OrganizeSubtasksInput): Promise<OrganizeSubtasksOutput> {
  return organizeSubtasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'organizeSubtasksPrompt',
  input: {schema: OrganizeSubtasksInputSchema},
  output: {schema: OrganizeSubtasksOutputSchema},
  prompt: `You are an AI project management assistant helping users to organize their projects.

The user is working on the project named: {{{projectName}}}

The project has the following stages: {{#each stages}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Given the following subtasks:
{{#each subtasks}}
- Name: {{{name}}}, Description: {{{description}}}
{{/each}}

Please categorize the subtasks by stage, and suggest an end date (ISO format) for each subtask. Return the categorized subtasks with the suggested end dates.

Output in JSON format:
`, // UPDATED prompt text
});

const organizeSubtasksFlow = ai.defineFlow(
  {
    name: 'organizeSubtasksFlow',
    inputSchema: OrganizeSubtasksInputSchema,
    outputSchema: OrganizeSubtasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
