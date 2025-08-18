// src/ai/flows/meal-plan-generator.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a weekly meal plan based on user quiz answers.
 *
 * It exports:
 * - `generateMealPlan`: An async function that takes user's goal, diet, and allergies and returns a meal plan.
 * - `MealPlanInput`: The input type for the `generateMealPlan` function.
 * - `MealPlanOutput`: The output type for the `generateMealPlan` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealPlanInputSchema = z.object({
  goal: z.string().describe('The user\'s primary fitness goal (e.g., "Perder Peso", "Ganhar Massa Muscular").'),
  diet: z.string().describe('The user\'s dietary preference (e.g., "Sem Restrições", "Vegetariana").'),
  allergies: z.string().describe('A list of user\'s allergies, comma-separated (e.g., "Glúten, lactose").'),
});
export type MealPlanInput = z.infer<typeof MealPlanInputSchema>;

const MealSchema = z.object({
    "Café da Manhã": z.array(z.string()).describe("Items for Breakfast."),
    "Almoço": z.array(z.string()).describe("Items for Lunch."),
    "Lanche": z.array(z.string()).describe("Items for Snack."),
    "Jantar": z.array(z.string()).describe("Items for Dinner."),
});

const MealPlanOutputSchema = z.object({
  mealPlan: z.object({
    Seg: MealSchema,
    Ter: MealSchema,
    Qua: MealSchema,
    Qui: MealSchema,
    Sex: MealSchema,
    Sáb: MealSchema,
    Dom: MealSchema,
  }).describe('A 7-day meal plan, with 4 meals per day.'),
});
export type MealPlanOutput = z.infer<typeof MealPlanOutputSchema>;

export async function generateMealPlan(
  input: MealPlanInput
): Promise<MealPlanOutput> {
  return mealPlanFlow(input);
}

const mealPlanPrompt = ai.definePrompt({
  name: 'mealPlanPrompt',
  input: {schema: MealPlanInputSchema},
  output: {schema: MealPlanOutputSchema},
  prompt: `Você é um nutricionista especialista em criar planos alimentares para frequentadores de academia no Brasil.

Crie um plano alimentar de 7 dias (Segunda a Domingo) focado em comida brasileira, que seja saudável, balanceado e delicioso.
O plano deve ser totalmente personalizado de acordo com as seguintes informações do usuário:

- **Objetivo Principal:** {{{goal}}}
- **Preferência de Dieta:** {{{diet}}}
- **Alergias e Restrições:** {{{allergies}}}

**Instruções:**
1.  **Estrutura:** Para cada dia, forneça 4 refeições: Café da Manhã, Almoço, Lanche e Jantar.
2.  **Conteúdo:** Cada refeição deve conter uma lista de itens alimentares. Seja específico (ex: "1 fatia de pão integral" em vez de "pão").
3.  **Personalização:** Adapte estritamente as sugestões para atender ao objetivo, dieta e alergias do usuário. Se o usuário for vegetariano, não inclua carne ou peixe. Se tiver alergia a glúten, evite trigo, cevada e centeio.
4.  **Idioma:** A resposta DEVE ser em Português do Brasil.
5.  **Formato:** A saída deve ser um objeto JSON estruturado, conforme o schema definido. Não adicione texto ou explicações fora do JSON.
`,
});

const mealPlanFlow = ai.defineFlow(
  {
    name: 'mealPlanFlow',
    inputSchema: MealPlanInputSchema,
    outputSchema: MealPlanOutputSchema,
  },
  async input => {
    const {output} = await mealPlanPrompt(input);
    return output!;
  }
);
