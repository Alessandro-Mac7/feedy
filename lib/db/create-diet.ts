import { after } from "next/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { estimateMacros } from "@/lib/groq/estimate";
import type { ParsedMeal, Diet } from "@/types";

export async function createDietWithMeals(params: {
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  parsedMeals: ParsedMeal[];
  createdBy?: string;
}): Promise<Diet> {
  const { userId, name, startDate, endDate, parsedMeals, createdBy } = params;

  // Create diet
  const [diet] = await db
    .insert(diets)
    .values({
      userId,
      dietName: name,
      startDate,
      endDate,
      isActive: false,
      createdBy: createdBy ?? null,
    })
    .returning();

  // Insert all meals
  await db.insert(meals).values(
    parsedMeals.map((m) => ({
      dietId: diet.id,
      day: m.day,
      mealType: m.mealType,
      foods: m.foods,
      carbs: m.carbs,
      fats: m.fats,
      proteins: m.proteins,
      notes: m.notes,
      isAiEstimated: false,
    }))
  );

  // Background: estimate macros for meals without them
  after(async () => {
    try {
      const mealsWithoutMacros = await db
        .select()
        .from(meals)
        .where(and(eq(meals.dietId, diet.id), isNull(meals.carbs)));

      for (const meal of mealsWithoutMacros) {
        const MAX_ATTEMPTS = 2;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          try {
            const estimate = await estimateMacros(meal.foods);
            await db
              .update(meals)
              .set({
                carbs: estimate.carbs,
                fats: estimate.fats,
                proteins: estimate.proteins,
                isAiEstimated: true,
              })
              .where(eq(meals.id, meal.id));
            console.log(`[AI Macro] Stimato: ${meal.mealType} ${meal.day}`);
            break;
          } catch (err) {
            console.error(
              `[AI Macro] Tentativo ${attempt}/${MAX_ATTEMPTS} fallito per ${meal.id}:`,
              err
            );
            if (attempt < MAX_ATTEMPTS) {
              await new Promise((r) => setTimeout(r, 1000));
            }
          }
        }
      }

      console.log(
        `[AI Macro] Completato: ${mealsWithoutMacros.length} pasti stimati per dieta ${diet.id}`
      );
    } catch (err) {
      console.error("[AI Macro] Errore nel background job:", err);
    }
  });

  return diet;
}
