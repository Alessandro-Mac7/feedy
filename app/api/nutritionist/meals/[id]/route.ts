import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { estimateMacros } from "@/lib/groq/estimate";

async function verifyNutritionistMealAccess(mealId: string, nutritionistUserId: string) {
  const [row] = await db
    .select({ meal: meals, diet: diets })
    .from(meals)
    .innerJoin(diets, eq(meals.dietId, diets.id))
    .where(
      and(
        eq(meals.id, mealId),
        eq(diets.createdBy, nutritionistUserId)
      )
    );

  return row;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const row = await verifyNutritionistMealAccess(id, nutritionist.userId);

  if (!row) {
    return NextResponse.json({ error: "Pasto non trovato" }, { status: 404 });
  }

  const body = await req.json();
  const { foods, carbs, fats, proteins, notes } = body;

  const macrosProvided =
    carbs !== undefined ||
    fats !== undefined ||
    proteins !== undefined;

  const foodsChanged =
    foods !== undefined && foods.trim() !== row.meal.foods;

  // If foods changed and no new macros provided, we'll re-estimate
  const shouldReEstimate = foodsChanged && !macrosProvided;

  const [updated] = await db
    .update(meals)
    .set({
      ...(foods !== undefined && { foods: foods.trim() }),
      ...(carbs !== undefined && { carbs }),
      ...(fats !== undefined && { fats }),
      ...(proteins !== undefined && { proteins }),
      ...(notes !== undefined && { notes }),
      ...(macrosProvided && { isAiEstimated: false }),
      ...(shouldReEstimate && { isAiEstimated: true }),
    })
    .where(eq(meals.id, id))
    .returning();

  // Background re-estimation when foods changed
  if (shouldReEstimate) {
    after(async () => {
      try {
        const estimate = await estimateMacros(foods.trim());
        await db
          .update(meals)
          .set({
            carbs: estimate.carbs,
            fats: estimate.fats,
            proteins: estimate.proteins,
            isAiEstimated: true,
          })
          .where(eq(meals.id, id));
        console.log(`[AI Macro] Re-stimato pasto ${id} dopo modifica alimenti (nutritionist)`);
      } catch (err) {
        console.error(`[AI Macro] Errore re-stima pasto ${id}:`, err);
      }
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const row = await verifyNutritionistMealAccess(id, nutritionist.userId);

  if (!row) {
    return NextResponse.json({ error: "Pasto non trovato" }, { status: 404 });
  }

  await db.delete(meals).where(eq(meals.id, id));

  return NextResponse.json({ ok: true });
}
