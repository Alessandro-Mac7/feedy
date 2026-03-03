import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { nutritionistPatients, diets, meals } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createDietWithMeals } from "@/lib/db/create-diet";
import type { ParsedMeal } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  // Verify this patient belongs to this nutritionist
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
    return NextResponse.json(
      { error: "Paziente non trovato." },
      { status: 404 }
    );
  }

  // Get patient's diets with meal count
  const patientDiets = await db
    .select({
      id: diets.id,
      userId: diets.userId,
      dietName: diets.dietName,
      startDate: diets.startDate,
      endDate: diets.endDate,
      isActive: diets.isActive,
      createdBy: diets.createdBy,
      createdAt: diets.createdAt,
      mealCount: sql<number>`count(${meals.id})::int`,
    })
    .from(diets)
    .leftJoin(meals, eq(meals.dietId, diets.id))
    .where(eq(diets.userId, patient.patientUserId))
    .groupBy(diets.id)
    .orderBy(desc(diets.createdAt));

  return NextResponse.json(patientDiets);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  // Verify this patient belongs to this nutritionist
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
    return NextResponse.json(
      { error: "Paziente non trovato." },
      { status: 404 }
    );
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

  const diet = await createDietWithMeals({
    userId: patient.patientUserId,
    name,
    startDate,
    endDate,
    parsedMeals,
    createdBy: nutritionist.userId,
  });

  return NextResponse.json(diet, { status: 201 });
}
