import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const [diet] = await db
    .select()
    .from(diets)
    .where(and(eq(diets.id, id), eq(diets.userId, session.data.user.id)));

  if (!diet) {
    return NextResponse.json({ error: "Dieta non trovata" }, { status: 404 });
  }

  const dietMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.dietId, id));

  return NextResponse.json({ ...diet, meals: dietMeals });
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

  const [diet] = await db
    .select()
    .from(diets)
    .where(and(eq(diets.id, id), eq(diets.userId, session.data.user.id)));

  if (!diet) {
    return NextResponse.json({ error: "Dieta non trovata" }, { status: 404 });
  }

  await db.delete(diets).where(eq(diets.id, id));

  return NextResponse.json({ ok: true });
}
