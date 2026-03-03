import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { nutritionistPatients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const deleted = await db
    .delete(nutritionistPatients)
    .where(
      and(
        eq(nutritionistPatients.id, id),
        eq(nutritionistPatients.nutritionistId, nutritionist.id)
      )
    )
    .returning();

  if (!deleted.length) {
    return NextResponse.json(
      { error: "Paziente non trovato." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
