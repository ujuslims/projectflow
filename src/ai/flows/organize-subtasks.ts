
'use server';

/**
 * @fileOverview AI agent that suggests subtask organization and deadlines for project planning,
 * specializing in topographic survey, geotechnical, geophysical, geospatial, construction,
 * and reality scanning projects.
 *
 * - organizeSubtasks - A function that organizes subtasks by stage and suggests deadlines.
 * - OrganizeSubtasksInput - The input type for the organizeSubtasks function.
 * - OrganizeSubtasksOutput - The return type for the organizeSubtasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrganizeSubtasksInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  stages: z.array(z.string()).describe('The different stages of the project, as defined by the user.'),
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
        endDate: z.string().optional().describe('A suggested end date for the subtask (ISO format).'),
      })
    )
  ).describe('Subtasks categorized by the user-defined stages, with suggested end dates.'),
});

export type OrganizeSubtasksOutput = z.infer<typeof OrganizeSubtasksOutputSchema>;

export async function organizeSubtasks(input: OrganizeSubtasksInput): Promise<OrganizeSubtasksOutput> {
  return organizeSubtasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'organizeSubtasksPrompt',
  input: {schema: OrganizeSubtasksInputSchema},
  output: {schema: OrganizeSubtasksOutputSchema},
  prompt: `You are an AI project management assistant specializing in topographic survey, geotechnical, geophysical, geospatial, construction, and reality scanning projects.

The user is working on the project named: {{{projectName}}}

The project has the following user-defined stages: {{#each stages}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Given the following subtasks:
{{#each subtasks}}
- Name: {{{name}}}, Description: {{{description}}}
{{/each}}

Please categorize the subtasks into the user-defined stages.
When categorizing, consider common workflows, dependencies, and typical project phases for projects in the specified industries (e.g., planning, site mobilization, fieldwork, data processing, analysis, reporting, demobilization, deliverables).
Also, suggest an end date (ISO format) for each subtask.

Return the categorized subtasks with the suggested end dates.
Output in JSON format:
`,
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
