import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { nutritionistPatients, nutritionists } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const userId = session.data.user.id;

  const associations = await db
    .select({
      id: nutritionistPatients.id,
      nutritionistName: nutritionists.displayName,
      nutritionistEmail: sql<string>`(SELECT email FROM "neon_auth"."user" WHERE id::text = ${nutritionists.userId})`,
      confirmed: nutritionistPatients.confirmed,
      addedAt: nutritionistPatients.addedAt,
    })
    .from(nutritionistPatients)
    .innerJoin(
      nutritionists,
      eq(nutritionistPatients.nutritionistId, nutritionists.id)
    )
    .where(eq(nutritionistPatients.patientUserId, userId));

  return NextResponse.json(associations);
}

export async function PATCH(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const userId = session.data.user.id;
  const id = req.nextUrl.searchParams.get("id");
  const action = req.nextUrl.searchParams.get("action");

  if (!id || !action || !["confirm", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Parametri mancanti: id e action (confirm|reject) richiesti." },
      { status: 400 }
    );
  }

  // Verify this association belongs to the current user
  const [association] = await db
    .select()
    .from(nutritionistPatients)
    .where(
      and(
        eq(nutritionistPatients.id, id),
        eq(nutritionistPatients.patientUserId, userId)
      )
    )
    .limit(1);

  if (!association) {
    return NextResponse.json(
      { error: "Associazione non trovata." },
      { status: 404 }
    );
  }

  if (action === "confirm") {
    await db
      .update(nutritionistPatients)
      .set({ confirmed: true })
      .where(eq(nutritionistPatients.id, id));
    return NextResponse.json({ ok: true });
  }

  // action === "reject"
  await db
    .delete(nutritionistPatients)
    .where(eq(nutritionistPatients.id, id));
  return NextResponse.json({ ok: true });
}
