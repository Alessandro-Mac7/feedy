import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

  const macrosChanged =
    carbs !== undefined ||
    fats !== undefined ||
    proteins !== undefined;

  const [updated] = await db
    .update(meals)
    .set({
      ...(foods !== undefined && { foods }),
      ...(carbs !== undefined && { carbs }),
      ...(fats !== undefined && { fats }),
      ...(proteins !== undefined && { proteins }),
      ...(notes !== undefined && { notes }),
      ...(isCompleted !== undefined && { isCompleted }),
      ...(macrosChanged && { isAiEstimated: false }),
    })
    .where(eq(meals.id, id))
    .returning();

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

  await db.delete(meals).where(eq(meals.id, id));

  return NextResponse.json({ ok: true });
}
