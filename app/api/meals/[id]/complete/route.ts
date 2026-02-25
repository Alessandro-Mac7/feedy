import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
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

  const [row] = await db
    .select({ meal: meals, diet: diets })
    .from(meals)
    .innerJoin(diets, eq(meals.dietId, diets.id))
    .where(and(eq(meals.id, id), eq(diets.userId, session.data.user.id)));

  if (!row) {
    return NextResponse.json({ error: "Pasto non trovato" }, { status: 404 });
  }

  const [updated] = await db
    .update(meals)
    .set({ isCompleted: !row.meal.isCompleted })
    .where(eq(meals.id, id))
    .returning();

  return NextResponse.json(updated);
}
