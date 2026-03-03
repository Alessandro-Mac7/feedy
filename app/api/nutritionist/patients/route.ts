import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { nutritionistPatients } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const patients = await db
    .select()
    .from(nutritionistPatients)
    .where(eq(nutritionistPatients.nutritionistId, nutritionist.id))
    .orderBy(nutritionistPatients.addedAt);

  return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { email, name } = body as { email: string; name?: string };

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email obbligatoria." },
      { status: 400 }
    );
  }

  // Resolve email → userId via Neon Auth users_sync table
  const userRows = await db.execute(
    sql`SELECT id FROM neon_auth.users_sync WHERE email = ${email.trim().toLowerCase()}`
  );

  if (!userRows.rows.length) {
    return NextResponse.json(
      { error: "Nessun utente trovato con questa email." },
      { status: 404 }
    );
  }

  const patientUserId = userRows.rows[0].id as string;

  // Check if already added
  const existing = await db
    .select()
    .from(nutritionistPatients)
    .where(
      sql`${nutritionistPatients.nutritionistId} = ${nutritionist.id} AND ${nutritionistPatients.patientUserId} = ${patientUserId}`
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Paziente già collegato." },
      { status: 409 }
    );
  }

  const [patient] = await db
    .insert(nutritionistPatients)
    .values({
      nutritionistId: nutritionist.id,
      patientUserId,
      patientEmail: email.trim().toLowerCase(),
      patientName: name?.trim() || null,
    })
    .returning();

  return NextResponse.json(patient, { status: 201 });
}
