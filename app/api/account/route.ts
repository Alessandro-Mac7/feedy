import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const userId = session.data.user.id;

  const userDiets = await db
    .select()
    .from(diets)
    .where(eq(diets.userId, userId));

  const dietsWithMeals = await Promise.all(
    userDiets.map(async (diet) => {
      const dietMeals = await db
        .select()
        .from(meals)
        .where(eq(meals.dietId, diet.id));
      return { ...diet, meals: dietMeals };
    })
  );

  return NextResponse.json({
    user: {
      id: userId,
      email: session.data.user.email,
      name: session.data.user.name,
    },
    diets: dietsWithMeals,
    exportedAt: new Date().toISOString(),
  });
}

export async function DELETE() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const userId = session.data.user.id;

  // Get all diet IDs for this user
  const userDiets = await db
    .select({ id: diets.id })
    .from(diets)
    .where(eq(diets.userId, userId));

  const dietIds = userDiets.map((d) => d.id);

  // Delete meals for all user's diets
  if (dietIds.length > 0) {
    await db.delete(meals).where(inArray(meals.dietId, dietIds));
  }

  // Delete all user's diets
  await db.delete(diets).where(eq(diets.userId, userId));

  return NextResponse.json({ ok: true });
}
