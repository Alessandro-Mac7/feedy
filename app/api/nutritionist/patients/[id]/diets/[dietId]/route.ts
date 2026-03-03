import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { nutritionistPatients, diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: Request,
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

  // Get diet (must belong to patient and be created by this nutritionist)
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

  const dietMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.dietId, dietId));

  return NextResponse.json({ ...diet, meals: dietMeals });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; dietId: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id, dietId } = await params;

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
  const { dietName, startDate, endDate, isActive } = body as {
    dietName?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (dietName?.trim()) updates.dietName = dietName.trim();
  if (startDate) updates.startDate = startDate;
  if (endDate) updates.endDate = endDate;
  if (typeof isActive === "boolean") updates.isActive = isActive;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nessuna modifica." }, { status: 400 });
  }

  // If activating, deactivate all other diets for this patient first
  if (isActive === true) {
    await db
      .update(diets)
      .set({ isActive: false })
      .where(eq(diets.userId, patient.patientUserId));
  }

  const [updated] = await db
    .update(diets)
    .set(updates)
    .where(eq(diets.id, dietId))
    .returning();

  return NextResponse.json(updated);
}
