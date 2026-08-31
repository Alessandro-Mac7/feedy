import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals, familyShares } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Read-only view of a family member's active diet, gated by a confirmed share.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { ownerId } = await params;

  const [share] = await db
    .select()
    .from(familyShares)
    .where(
      and(
        eq(familyShares.ownerUserId, ownerId),
        eq(familyShares.memberUserId, session.data.user.id),
        eq(familyShares.confirmed, true)
      )
    )
    .limit(1);

  if (!share) {
    return NextResponse.json(
      { error: "Non hai accesso alla dieta di questa persona." },
      { status: 403 }
    );
  }

  const [diet] = await db
    .select()
    .from(diets)
    .where(and(eq(diets.userId, ownerId), eq(diets.isActive, true)))
    .limit(1);

  if (!diet) {
    return NextResponse.json({ diet: null, meals: [] });
  }

  const dietMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.dietId, diet.id));

  return NextResponse.json({ diet, meals: dietMeals });
}
