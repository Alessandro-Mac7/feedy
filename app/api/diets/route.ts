import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { estimateMacros } from "@/lib/groq/estimate";
import type { ParsedMeal } from "@/types";

export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const userDiets = await db
    .select()
    .from(diets)
    .where(eq(diets.userId, session.data.user.id))
    .orderBy(desc(diets.createdAt));

  return NextResponse.json(userDiets);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { name, startDate, endDate, parsedMeals } = body as {
    name: string;
    startDate: string;
    endDate: string;
    parsedMeals: ParsedMeal[];
  };

  if (!name || !startDate || !endDate || !parsedMeals?.length) {
    return NextResponse.json(
      { error: "Dati mancanti: nome, date e pasti sono obbligatori." },
      { status: 400 }
    );
  }

  // Create diet
  const [diet] = await db
    .insert(diets)
    .values({
      userId: session.data.user.id,
      dietName: name,
      startDate,
      endDate,
      isActive: false,
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
        .where(
          and(
            eq(meals.dietId, diet.id),
            isNull(meals.carbs)
          )
        );

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
            console.error(`[AI Macro] Tentativo ${attempt}/${MAX_ATTEMPTS} fallito per ${meal.id}:`, err);
            if (attempt < MAX_ATTEMPTS) {
              await new Promise((r) => setTimeout(r, 1000));
            }
          }
        }
      }

      console.log(`[AI Macro] Completato: ${mealsWithoutMacros.length} pasti stimati per dieta ${diet.id}`);
    } catch (err) {
      console.error("[AI Macro] Errore nel background job:", err);
    }
  });

  return NextResponse.json(diet, { status: 201 });
}
