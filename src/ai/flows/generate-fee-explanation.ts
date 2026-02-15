'use server';
/**
 * @fileOverview A GenAI tool to help administrators generate clear, concise, and context-aware explanations for parents regarding specific fee components, outstanding balances, or upcoming due dates.
 *
 * - generateFeeExplanation - A function that handles the fee explanation generation process.
 * - GenerateFeeExplanationInput - The input type for the generateFeeExplanation function.
 * - GenerateFeeExplanationOutput - The return type for the generateFeeExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFeeExplanationInputSchema = z.object({
  studentName: z.string().describe("The name of the student for whom the fee explanation is being generated."),
  admissionNumber: z.string().describe("The admission number of the student."),
  feeComponent: z.string().optional().describe("Specific fee component to explain (e.g., 'Tuition Fee', 'Activity Fee')."),
  amount: z.number().optional().describe("The amount related to the fee component, if applicable."),
  outstandingBalance: z.number().optional().describe("The total outstanding balance for the student, if applicable."),
  dueDate: z.string().optional().describe("The due date for the payment, if applicable (format: YYYY-MM-DD)."),
  additionalContext: z.string().optional().describe("Any additional context or specific instructions from the administrator for the explanation."),
});
export type GenerateFeeExplanationInput = z.infer<typeof GenerateFeeExplanationInputSchema>;

const GenerateFeeExplanationOutputSchema = z.object({
  explanation: z.string().describe("A clear, concise, and context-aware explanation of the fee for parents."),
});
export type GenerateFeeExplanationOutput = z.infer<typeof GenerateFeeExplanationOutputSchema>;

export async function generateFeeExplanation(input: GenerateFeeExplanationInput): Promise<GenerateFeeExplanationOutput> {
  return generateFeeExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeeExplanationPrompt',
  input: { schema: GenerateFeeExplanationInputSchema },
  output: { schema: GenerateFeeExplanationOutputSchema },
  prompt: `You are an AI assistant for a school fees management system named ScholarlyPay. Your task is to generate a clear, concise, and polite explanation for parents or guardians regarding their child's school fees.\nThe explanation should be professional, easy to understand, and address the specific details provided.\nFocus on explaining the situation clearly and what action is required from the parent.\nStart the explanation with a polite greeting.\n\nHere are the details for generating the explanation:\nStudent Name: {{{studentName}}}\nAdmission Number: {{{admissionNumber}}}\n{{#if feeComponent}}Fee Component: {{{feeComponent}}}{{/if}}\n{{#if amount}}Amount: {{{amount}}}{{/if}}\n{{#if outstandingBalance}}Outstanding Balance: {{{outstandingBalance}}}{{/if}}\n{{#if dueDate}}Due Date: {{{dueDate}}}{{/if}}\n{{#if additionalContext}}Additional Context: {{{additionalContext}}}{{/if}}`,
});

const generateFeeExplanationFlow = ai.defineFlow(
  {
    name: 'generateFeeExplanationFlow',
    inputSchema: GenerateFeeExplanationInputSchema,
    outputSchema: GenerateFeeExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate fee explanation.");
    }
    return output;
  }
);
