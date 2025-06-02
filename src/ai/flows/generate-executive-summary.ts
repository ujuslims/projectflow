
'use server';
/**
 * @fileOverview AI agent that generates an executive summary for a project.
 *
 * - generateExecutiveSummary - A function that generates the project summary.
 * - GenerateExecutiveSummaryInput - The input type for the function.
 * - GenerateExecutiveSummaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutiveSummaryInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().optional().describe('The scope of work or detailed description of the project.'),
  status: z.string().optional().describe('The current status of the project (e.g., In Progress, Completed).'),
  startDate: z.string().optional().describe('The start date of the project (ISO format).'),
  dueDate: z.string().optional().describe('The due date of the project (ISO format).'),
  budget: z.number().optional().describe('The total budget allocated for the project.'),
  spent: z.number().optional().describe('The amount spent on the project so far.'),
  totalSubtasks: z.number().describe('The total number of subtasks in the project.'),
  completedSubtasks: z.number().describe('The number of completed subtasks in the project.'),
  outcomes: z.object({
    keyFindings: z.string().optional().describe('Key findings from the project.'),
    conclusions: z.string().optional().describe('Conclusions drawn from the project.'),
    recommendations: z.string().optional().describe('Recommendations based on the project outcomes.'),
    achievements: z.string().optional().describe('Notable achievements of the project.'),
    challenges: z.string().optional().describe('Challenges encountered during the project.'),
    lessonsLearned: z.string().optional().describe('Lessons learned from the project execution.'),
  }).describe('Structured outcomes of the project.'),
});

export type GenerateExecutiveSummaryInput = z.infer<typeof GenerateExecutiveSummaryInputSchema>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  executiveSummary: z.string().describe("A concise executive summary of the project (2-4 paragraphs). It should cover the project's purpose, key progress, financial status, main outcomes (findings, achievements, challenges), and any critical recommendations. The tone should be professional and informative."),
});

export type GenerateExecutiveSummaryOutput = z.infer<typeof GenerateExecutiveSummaryOutputSchema>;

export async function generateExecutiveSummary(input: GenerateExecutiveSummaryInput): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are an AI assistant tasked with generating a professional executive summary for a project.
Project Name: {{{projectName}}}
{{#if projectDescription}}Scope of Work: {{{projectDescription}}}{{/if}}
Status: {{{status}}}
{{#if startDate}}Start Date: {{{startDate}}}{{/if}}
{{#if dueDate}}Due Date: {{{dueDate}}}{{/if}}
Budget: {{{budget}}}
Spent: {{{spent}}}
Task Progress: {{{completedSubtasks}}}/{{{totalSubtasks}}} completed.

Project Outcomes:
{{#if outcomes.keyFindings}}- Key Findings: {{{outcomes.keyFindings}}}{{/if}}
{{#if outcomes.conclusions}}- Conclusions: {{{outcomes.conclusions}}}{{/if}}
{{#if outcomes.recommendations}}- Recommendations: {{{outcomes.recommendations}}}{{/if}}
{{#if outcomes.achievements}}- Achievements: {{{outcomes.achievements}}}{{/if}}
{{#if outcomes.challenges}}- Challenges: {{{outcomes.challenges}}}{{/if}}
{{#if outcomes.lessonsLearned}}- Lessons Learned: {{{outcomes.lessonsLearned}}}{{/if}}

Based on the information above, generate a concise and informative executive summary (2-4 paragraphs). The summary should:
1. Briefly introduce the project and its main objectives.
2. Highlight key progress, including task completion and adherence to schedule (if dates are available).
3. Summarize the financial status (budget vs. spent).
4. Integrate the most important aspects from the Project Outcomes (achievements, key findings, challenges, and key recommendations).
5. Conclude with an overall assessment or outlook.

Ensure the tone is professional and suitable for stakeholders.
Focus on clarity and conciseness.
Return the summary as a single string under the 'executiveSummary' key.
`,
});

const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: GenerateExecutiveSummaryInputSchema,
    outputSchema: GenerateExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
