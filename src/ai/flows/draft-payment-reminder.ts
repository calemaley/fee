
'use server';
/**
 * @fileOverview This file implements a Genkit flow for drafting personalized payment reminder messages for parents.
 *
 * - draftPaymentReminder - A function that generates a payment reminder message.
 * - PaymentReminderInput - The input type for the draftPaymentReminder function.
 * - PaymentReminderOutput - The return type for the draftPaymentReminder function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PaymentReminderInputSchema = z.object({
  parentName: z.string().describe("The name of the parent or guardian."),
  studentName: z.string().describe("The name of the child."),
  admissionNumber: z.string().describe("The child's unique admission number."),
  amountDue: z.string().describe("The amount of school fees due, e.g., 'KES 5,000.00'."),
  dueDate: z.string().describe("The due date for the payment, e.g., 'October 26, 2024'."),
  feeDetails: z.string().optional().describe("Optional additional details about the fees, e.g., 'First term tuition'."),
});
export type PaymentReminderInput = z.infer<typeof PaymentReminderInputSchema>;

const PaymentReminderOutputSchema = z.object({
  subject: z.string().describe("The subject line for the payment reminder email or message."),
  body: z.string().describe("The main body content of the payment reminder message."),
});
export type PaymentReminderOutput = z.infer<typeof PaymentReminderOutputSchema>;

export async function draftPaymentReminder(input: PaymentReminderInput): Promise<PaymentReminderOutput> {
  return draftPaymentReminderFlow(input);
}

const paymentReminderPrompt = ai.definePrompt({
  name: 'paymentReminderPrompt',
  input: { schema: PaymentReminderInputSchema },
  output: { schema: PaymentReminderOutputSchema },
  prompt: `You are an AI assistant for a school administration system. Your task is to draft a polite and clear payment reminder message for a parent.

The reminder should include:
- The parent's name.
- The child's name and admission number.
- The amount due in Kenyan Shillings (KES).
- The due date.
- Any additional fee details provided.

The message should be professional and encourage timely payment, and explicitly mention the school name as 'ScholarlyPay School'.

Input details:
Parent Name: {{{parentName}}}
Student Name: {{{studentName}}}
Admission Number: {{{admissionNumber}}}
Amount Due: {{{amountDue}}}
Due Date: {{{dueDate}}}
{{#if feeDetails}}
Additional Fee Details: {{{feeDetails}}}
{{/if}}

Please generate a subject line and a body for the reminder message.
`,
});

const draftPaymentReminderFlow = ai.defineFlow(
  {
    name: 'draftPaymentReminderFlow',
    inputSchema: PaymentReminderInputSchema,
    outputSchema: PaymentReminderOutputSchema,
  },
  async (input) => {
    const { output } = await paymentReminderPrompt(input);
    if (!output) {
      throw new Error('Failed to generate payment reminder.');
    }
    return output;
  }
);
