import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { nutritionistPatients, diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DAYS, MEAL_TYPES } from "@/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; dietId: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id, dietId } = await params;

  // Verify patient belongs to this nutritionist
  const [patient] = await db
    .select()
    .from(nutritionistPatients)
    .where(
      and(
        eq(nutritionistPatients.id, id),
        eq(nutritionistPatients.nutritionistId, nutritionist.id)
      )
    )
    .limit(1);

  if (!patient) {
    return NextResponse.json({ error: "Paziente non trovato." }, { status: 404 });
  }

  if (!patient.confirmed) {
    return NextResponse.json(
      { error: "In attesa di conferma dal paziente." },
      { status: 403 }
    );
  }

  // Verify diet belongs to patient and was created by this nutritionist
  const [diet] = await db
    .select()
    .from(diets)
    .where(
      and(
        eq(diets.id, dietId),
        eq(diets.userId, patient.patientUserId),
        eq(diets.createdBy, nutritionist.userId)
      )
    );

  if (!diet) {
    return NextResponse.json(
      { error: "Dieta non trovata o non creata da te." },
      { status: 404 }
    );
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
