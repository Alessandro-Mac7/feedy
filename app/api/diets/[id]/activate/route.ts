import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  // Verify diet belongs to user
  const [diet] = await db
    .select()
    .from(diets)
    .where(and(eq(diets.id, id), eq(diets.userId, session.data.user.id)));

  if (!diet) {
    return NextResponse.json({ error: "Dieta non trovata" }, { status: 404 });
  }

  // Deactivate all user's diets and activate the target in a transaction
  const userId = session.data.user.id;
  await db.transaction(async (tx) => {
    await tx.update(diets).set({ isActive: false }).where(eq(diets.userId, userId));
    await tx.update(diets).set({ isActive: true }).where(eq(diets.id, id));
  });

  return NextResponse.json({ ok: true });
}
