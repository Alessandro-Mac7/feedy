import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { nutritionistPatients, diets, meals } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { createDietWithMeals } from "@/lib/db/create-diet";
import type { ParsedMeal } from "@/types";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const dietId = req.nextUrl.searchParams.get("dietId");

  if (!dietId) {
    return NextResponse.json({ error: "dietId richiesto" }, { status: 400 });
  }

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

  // Get diet and verify it was created by this nutritionist
  const [diet] = await db
    .select()
    .from(diets)
    .where(
      and(
        eq(diets.id, dietId),
        eq(diets.userId, patient.patientUserId),
        eq(diets.createdBy, nutritionist.userId)
      )
    )
    .limit(1);

  if (!diet) {
    return NextResponse.json(
      { error: "Dieta non trovata o non creata da te." },
      { status: 403 }
    );
  }

  await db.delete(diets).where(eq(diets.id, dietId));

  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { dietId, action } = body as { dietId: string; action: string };

  if (!dietId) {
    return NextResponse.json({ error: "dietId richiesto" }, { status: 400 });
  }

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

  // Get the source diet (for duplicate: any diet is ok; for other actions: must be owned)
  const [sourceDiet] = await db
    .select()
    .from(diets)
    .where(
      and(
        eq(diets.id, dietId),
        eq(diets.userId, patient.patientUserId)
      )
    )
    .limit(1);

  if (!sourceDiet) {
    return NextResponse.json({ error: "Dieta non trovata." }, { status: 404 });
  }

  if (action === "duplicate") {
    // Get all meals from source diet
    const sourceMeals = await db
      .select()
      .from(meals)
      .where(eq(meals.dietId, dietId));

    const parsedMeals: ParsedMeal[] = sourceMeals.map((m) => ({
      day: m.day as ParsedMeal["day"],
      mealType: m.mealType as ParsedMeal["mealType"],
      foods: m.foods,
      carbs: m.carbs,
      fats: m.fats,
      proteins: m.proteins,
      notes: m.notes,
    }));

    const newDiet = await createDietWithMeals({
      userId: patient.patientUserId,
      name: `${sourceDiet.dietName} (copia)`,
      startDate: sourceDiet.startDate,
      endDate: sourceDiet.endDate,
      parsedMeals,
      createdBy: nutritionist.userId,
    });

    return NextResponse.json(newDiet, { status: 201 });
  }

  return NextResponse.json({ error: "Azione non supportata" }, { status: 400 });
}

export async function GET(
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

  if (!patient.confirmed) {
    return NextResponse.json(
      { error: "In attesa di conferma dal paziente." },
      { status: 403 }
    );
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "10"), 50);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  // Get patient's diets with meal count and creator info
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
      creatorName: sql<string | null>`(SELECT name FROM "neon_auth"."user" WHERE id = ${diets.createdBy})`,
      creatorEmail: sql<string | null>`(SELECT email FROM "neon_auth"."user" WHERE id = ${diets.createdBy})`,
    })
    .from(diets)
    .leftJoin(meals, eq(meals.dietId, diets.id))
    .where(eq(diets.userId, patient.patientUserId))
    .groupBy(diets.id)
    .orderBy(desc(diets.createdAt))
    .limit(limit)
    .offset(offset);

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

  if (!patient.confirmed) {
    return NextResponse.json(
      { error: "In attesa di conferma dal paziente." },
      { status: 403 }
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
