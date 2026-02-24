import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DAYS, MEAL_TYPES } from "@/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id: dietId } = await params;

  const [diet] = await db
    .select()
    .from(diets)
    .where(and(eq(diets.id, dietId), eq(diets.userId, session.data.user.id)));

  if (!diet) {
    return NextResponse.json({ error: "Dieta non trovata" }, { status: 404 });
  }

  const body = await req.json();
  const { day, mealType, foods, carbs, fats, proteins, notes } = body;

  if (!DAYS.includes(day)) {
    return NextResponse.json({ error: "Giorno non valido" }, { status: 400 });
  }
  if (!MEAL_TYPES.includes(mealType)) {
    return NextResponse.json(
      { error: "Tipo di pasto non valido" },
      { status: 400 }
    );
  }
  if (!foods || !foods.trim()) {
    return NextResponse.json(
      { error: "Gli alimenti sono obbligatori" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(meals)
    .values({
      dietId,
      day,
      mealType,
      foods: foods.trim(),
      carbs: carbs ?? null,
      fats: fats ?? null,
      proteins: proteins ?? null,
      notes: notes?.trim() || null,
      isAiEstimated: false,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
