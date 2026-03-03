import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { estimateMacros } from "@/lib/groq/estimate";

async function verifyMealOwnership(mealId: string, userId: string) {
  const [row] = await db
    .select({ meal: meals, diet: diets })
    .from(meals)
    .innerJoin(diets, eq(meals.dietId, diets.id))
    .where(and(eq(meals.id, mealId), eq(diets.userId, userId)));

  return row;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const row = await verifyMealOwnership(id, session.data.user.id);

  if (!row) {
    return NextResponse.json({ error: "Pasto non trovato" }, { status: 404 });
  }

  const body = await req.json();
  const { foods, carbs, fats, proteins, notes, isCompleted } = body;

  // If diet was created by a nutritionist, patient can only toggle isCompleted
  if (row.diet.createdBy) {
    if (typeof isCompleted === "boolean") {
      const [updated] = await db
        .update(meals)
        .set({ isCompleted })
        .where(eq(meals.id, id))
        .returning();
      return NextResponse.json(updated);
    }
    return NextResponse.json(
      { error: "Non puoi modificare i pasti di una dieta del nutrizionista." },
      { status: 403 }
    );
  }

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
      ...(isCompleted !== undefined && { isCompleted }),
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
        console.log(`[AI Macro] Re-stimato pasto ${id} dopo modifica alimenti`);
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
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const row = await verifyMealOwnership(id, session.data.user.id);

  if (!row) {
    return NextResponse.json({ error: "Pasto non trovato" }, { status: 404 });
  }

  if (row.diet.createdBy) {
    return NextResponse.json(
      { error: "Non puoi eliminare i pasti di una dieta del nutrizionista." },
      { status: 403 }
    );
  }

  await db.delete(meals).where(eq(meals.id, id));

  return NextResponse.json({ ok: true });
}
