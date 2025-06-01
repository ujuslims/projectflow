
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
  organizedStages: z.array(
    z.object({
      stageName: z.string().describe("The name of the stage, corresponding to one of the user-defined stages."),
      subtasks: z.array(
        z.object({
          name: z.string().describe('The name of the subtask.'),
          description: z.string().optional().describe('A description of the subtask.'),
          endDate: z.string().optional().describe('A suggested end date for the subtask (ISO format).'),
        })
      ).describe("The subtasks belonging to this stage.")
    })
  ).describe("An array of stages, each containing its categorized subtasks with suggested end dates. Ensure each stageName provided in the output corresponds to one of the input stages.")
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
- Name: {{{name}}}{{#if description}}, Description: {{{description}}}{{/if}}
{{/each}}

Please categorize the subtasks into the user-defined stages.
When categorizing, consider common workflows, dependencies, and typical project phases for projects in the specified industries (e.g., planning, site mobilization, fieldwork, data processing, analysis, reporting, demobilization, deliverables).
Also, suggest an end date (ISO format) for each subtask.

Return an array of objects under the key 'organizedStages'. Each object in this array represents a stage.
Each stage object must have a 'stageName' field (string, corresponding to one of the user-defined stages) and a 'subtasks' field (array of subtask objects).
Each subtask object within the 'subtasks' array must have a 'name' (string), an optional 'description' (string), and an optional 'endDate' (string, ISO format).
Ensure the output strictly follows this JSON structure.
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

