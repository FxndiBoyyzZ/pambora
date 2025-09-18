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
  diet: z.string().optional().describe('The user\'s dietary preference (e.g., "Sem Restrições", "Vegetariana"). Can be empty.'),
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
  prompt: `Você é um assistente de nutrição. Sua tarefa é adaptar um dos dois cardápios base abaixo de acordo com as restrições alimentares do usuário.

**Informações do Usuário:**
- **Objetivo Principal:** {{{goal}}}
- **Tipo de Dieta:** {{{diet}}}
- **Restrições Alimentares:** {{{allergies}}}

**Instruções:**
1.  **Selecione o Cardápio Base:**
    - Se o objetivo for "Perder Peso", use o "Cardápio Semanal – 1.300 kcal".
    - Se o objetivo for "Ganhar Massa Muscular", use o "Cardápio Semanal – 2.300 kcal".

2.  **Adapte o Cardápio:**
    - Analise as restrições alimentares do usuário e o tipo de dieta.
    - Se o campo "Tipo de Dieta" estiver vazio ou for "Sem Restrições", use o cardápio padrão, sem fazer adaptações de dieta.
    - Se for "Vegetariana", substitua todas as carnes (frango, peixe, carne moída, etc.) por equivalentes vegetarianos (ex: tofu, lentilha, grão de bico, omelete).
    - Faça as substituições **mínimas e mais simples possíveis** no cardápio base para evitar os alérgenos.
    - **Exemplos de Adaptações:**
        - Se a restrição for "lactose": substitua "iogurte" por "iogurte sem lactose", "leite" por "leite sem lactose", "queijo" por "queijo sem lactose".
        - Se a restrição for "glúten": substitua "pão integral" por "pão sem glúten", "aveia" por "aveia sem glúten", "macarrão integral" por "macarrão sem glúten".
        - Se a restrição for "amendoim": substitua "pasta de amendoim" por "pasta de castanha de caju".
    - **NÃO altere as quantidades ou a estrutura geral do cardápio.** Apenas substitua os itens problemáticos. 
    - Se o usuário indicar "Não possuo restrições" ou algo similar para alergias, não faça adaptações de alergia.

3.  **Formato da Saída:**
    - A saída DEVE ser um objeto JSON estruturado, conforme o schema definido.
    - No JSON final, o campo para o lanche da tarde deve se chamar "Lanche".
    - NÃO inclua o "Lanche manhã" ou a "Ceia" no JSON final.
    - NÃO adicione texto, introduções ou explicações fora do JSON.

---

**CARDÁPIOS BASE:**

**Cardápio Semanal – 1.300 kcal (Objetivo: Perder Peso)**

*   **Segunda-feira:**
    *   Café da manhã: 1 fatia de pão integral + 1 ovo mexido + 1 fatia de queijo branco + 1 banana pequena
    *   Lanche manhã: 1 iogurte natural desnatado
    *   Almoço: 3 col. sopa de arroz integral + 1 concha feijão + peito de frango grelhado + salada de folhas + 1 maçã
    *   Lanche tarde: 1 fatia de pão integral com pasta de ricota + 3 castanhas-do-pará
    *   Jantar: Omelete com 2 claras + 1 ovo inteiro + espinafre e tomate + salada
*   **Terça-feira:**
    *   Café da manhã: 2 torradas integrais + 1 colher de sopa de requeijão light + 1 fatia de mamão
    *   Lanche manhã: 1 banana pequena amassada com 1 colher de sopa de aveia
    *   Almoço: 3 col. sopa de batata doce amassada + filé de peixe grelhado + brócolis no vapor + 1 mexerica
    *   Lanche tarde: 1 iogurte grego light + 5 amêndoas
    *   Jantar: Sopa de legumes (abobrinha, cenoura, chuchu) com 1 filé de frango desfiado + salada
*   **Quarta-feira:**
    *   Café da manhã: 1 fatia de pão integral + 2 claras mexidas + 1 fatia de queijo minas + 1 laranja pequena
    *   Lanche manhã: 1 iogurte natural + 1 colher de chá de chia
    *   Almoço: 3 col. sopa de arroz integral + 1 concha feijão + carne moída magra + salada colorida + 1 fatia de melancia
    *   Lanche tarde: 1 fatia de pão integral com pasta de cottage + 3 nozes
    *   Jantar: Omelete de legumes (2 ovos) + salada verde
*   **Quinta-feira:**
    *   Café da manhã: 1 tapioca pequena com queijo branco + café sem açúcar + 1 fatia de manga
    *   Lanche manhã: 1 maçã pequena
    *   Almoço: 3 col. sopa de purê de batata doce + peito de frango + abobrinha grelhada + salada de folhas + 1 fatia de abacaxi
    *   Lanche tarde: 1 iogurte grego light + 6 amêndoas
    *   Jantar: Sopa de abóbora com carne desfiada + salada verde
*   **Sexta-feira:**
    *   Café da manhã: 1 fatia de pão integral + 1 ovo mexido + 1 fatia de queijo cottage + 1 fatia de mamão
    *   Lanche manhã: 1 banana pequena + 1 colher de sopa de aveia
    *   Almoço: 3 col. sopa de arroz integral + 1 concha feijão + filé de tilápia + brócolis e couve refogados + 1 pera pequena
    *   Lanche tarde: 1 fatia de pão integral com requeijão light + 3 castanhas-do-pará
    *   Jantar: Omelete de 2 ovos + espinafre + salada verde
*   **Sábado:**
    *   Café da manhã: 2 torradas integrais + 1 colher de sopa de ricota + 1 fatia de melancia
    *   Lanche manhã: 1 iogurte natural + 1 colher de sopa de linhaça
    *   Almoço: 3 col. sopa de arroz integral + peito de frango grelhado + legumes cozidos + 1 fatia de abacaxi
    *   Lanche tarde: 1 iogurte grego light + 5 nozes
    *   Jantar: Sopa de legumes com carne magra desfiada + salada de folhas
*   **Domingo:**
    *   Café da manhã: 1 tapioca pequena com queijo branco + 1 fatia de mamão + café sem açúcar
    *   Lanche manhã: 1 banana pequena + 1 colher de sopa de aveia
    *   Almoço: 3 col. sopa de batata doce amassada + peito de frango grelhado + salada colorida + 1 laranja pequena
    *   Lanche tarde: 1 fatia de pão integral com pasta de ricota + 6 amêndoas
    *   Jantar: Omelete de legumes (2 ovos) + salada verde

**Cardápio Semanal – 2.300 kcal (Objetivo: Ganhar Massa Muscular)**

*   **Segunda-feira:**
    *   Café da manhã: 2 fatias de pão integral + 2 ovos mexidos + 1 fatia de queijo minas + 1 banana grande + 1 colher de sopa de pasta de amendoim
    *   Lanche manhã: Iogurte grego + 2 colheres de granola + 1 colher de mel
    *   Almoço: 5 col. sopa de arroz integral + 1 concha feijão + peito de frango grande grelhado + salada com azeite + batata-doce média + fatia de melancia
    *   Lanche tarde: Sanduíche natural (pão integral, peito de peru, ricota, tomate, folhas) + 30 g de castanhas
    *   Jantar: 4 col. sopa de arroz integral + salmão grelhado + legumes refogados no azeite + salada de folhas com azeite
    *   Ceia: Leite desnatado + 2 col. sopa de aveia + cacau em pó + mel
*   **Terça-feira:**
    *   Café da manhã: 1 tapioca média com queijo minas + 2 ovos mexidos + 1 fatia de mamão + 1 colher de sopa de pasta de amendoim
    *   Lanche manhã: 1 vitamina de banana com leite desnatado + 1 colher de sopa de aveia
    *   Almoço: 5 col. sopa de purê de batata doce + filé grande de peixe grelhado + brócolis no vapor + salada com azeite + 1 mexerica
    *   Lanche tarde: 1 pão integral com atum e requeijão light + 20 g de amêndoas
    *   Jantar: Macarrão integral (1 prato pequeno) com peito de frango desfiado + molho de tomate caseiro + salada verde
    *   Ceia: 1 copo de leite + 1 colher de sopa de granola + 1 colher de chá de mel
*   **Quarta-feira:**
    *   Café da manhã: 2 fatias de pão integral + 2 claras + 1 ovo inteiro + queijo cottage + 1 laranja + 1 colher de sopa de pasta de amendoim
    *   Lanche manhã: 1 iogurte natural + 1 colher de chia + 1 banana pequena
    *   Almoço: 5 col. sopa de arroz integral + 1 concha feijão + carne moída magra + salada colorida com azeite + fatia de melancia
    *   Lanche tarde: 1 wrap integral de frango + folhas + 1 colher de sopa de homus + 20 g de castanhas
    *   Jantar: Omelete de 3 ovos com legumes + 1 fatia de pão integral + salada verde
    *   Ceia: 1 copo de leite morno com aveia e canela
*   **Quinta-feira:**
    *   Café da manhã: 1 tapioca média com queijo branco + 2 ovos mexidos + 1 fatia de manga + 1 colher de sopa de pasta de amendoim
    *   Lanche manhã: 1 maçã grande + 1 punhado de nozes
    *   Almoço: 5 col. sopa de purê de batata doce + peito de frango grelhado grande + abobrinha grelhada + salada de folhas com azeite + fatia de abacaxi
    *   Lanche tarde: 1 iogurte grego light + 2 col. de granola + 1 colher de mel
    *   Jantar: Risoto integral de frango com legumes (1 prato pequeno) + salada verde
    *   Ceia: 1 copo de leite com cacau em pó + 1 colher de sopa de aveia
*   **Sexta-feira:**
    *   Café da manhã: 2 fatias de pão integral + 2 ovos mexidos + queijo cottage + mamão + 1 colher de sopa de pasta de amendoim
    *   Lanche manhã: 1 vitamina de abacate com leite desnatado (pequena, sem açúcar)
    *   Almoço: 5 col. sopa de arroz integral + 1 concha feijão + filé de tilápia grande + brócolis refogado + salada de folhas com azeite + pera pequena
    *   Lanche tarde: Sanduíche integral de peito de peru + ricota + tomate + 30 g de castanhas
    *   Jantar: Omelete de 3 ovos + espinafre + salada verde + 1 fatia de pão integral
    *   Ceia: 1 copo de leite + 1 colher de sopa de aveia + mel
*   **Sábado:**
    *   Café da manhã: 2 torradas integrais + 1 colher de sopa de ricota + 2 ovos mexidos + melancia + 1 colher de sopa de pasta de amendoim
    *   Lanche manhã: 1 iogurte natural + 1 colher de linhaça + 1 banana pequena
    *   Almoço: 5 col. sopa de arroz integral + peito de frango grande grelhado + legumes cozidos + salada com azeite + 1 fatia de abacaxi
    *   Lanche tarde: 1 wrap integral com atum, ricota e folhas + 20 g de nozes
    *   Jantar: Lasanha de berinjela com frango (1 prato médio) + salada verde
    *   Ceia: 1 copo de leite com canela + 2 col. sopa de aveia
*   **Domingo:**
    *   Café da manhã: 1 tapioca média com queijo minas + 2 ovos mexidos + 1 fatia de mamão + 1 colher de sopa de pasta de amendoim
    *   Lanche manhã: 1 vitamina de morango com leite desnatado + 1 colher de sopa de chia
    *   Almoço: 5 col. sopa de batata doce + peito de frango grande grelhado + salada colorida com azeite + 1 laranja
    *   Lanche tarde: 1 pão integral com pasta de ricota + peito de peru + 30 g de castanhas
    *   Jantar: Omelete de 3 ovos com legumes + 1 fatia de pão integral + salada verde
    *   Ceia: 1 copo de leite com cacau em pó + 1 colher de sopa de aveia + mel

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
