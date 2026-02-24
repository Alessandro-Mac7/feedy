import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { meals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { estimateMacros } from "@/lib/groq/estimate";

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { mealId } = body as { mealId: string };

  if (!mealId) {
    return NextResponse.json(
      { error: "ID pasto mancante" },
      { status: 400 }
    );
  }

  // Fetch the meal
  const [meal] = await db
    .select()
    .from(meals)
    .where(eq(meals.id, mealId));

  if (!meal) {
    return NextResponse.json(
      { error: "Pasto non trovato" },
      { status: 404 }
    );
  }

  try {
    const estimate = await estimateMacros(meal.foods);

    // Update meal with estimated macros
    await db
      .update(meals)
      .set({
        carbs: estimate.carbs,
        fats: estimate.fats,
        proteins: estimate.proteins,
        isAiEstimated: true,
      })
      .where(eq(meals.id, mealId));

    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Errore stima macro:", error);
    return NextResponse.json(
      { error: "Errore durante la stima dei macronutrienti." },
      { status: 500 }
    );
  }
}
