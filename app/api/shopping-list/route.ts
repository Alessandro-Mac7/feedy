import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateShoppingList } from "@/lib/groq/shopping-list";

export async function POST() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Find active diet
  const [activeDiet] = await db
    .select()
    .from(diets)
    .where(
      and(eq(diets.userId, session.data.user.id), eq(diets.isActive, true))
    );

  if (!activeDiet) {
    return NextResponse.json(
      { error: "Nessuna dieta attiva" },
      { status: 404 }
    );
  }

  // Fetch all meals for the active diet
  const dietMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.dietId, activeDiet.id));

  if (dietMeals.length === 0) {
    return NextResponse.json(
      { error: "Nessun pasto trovato" },
      { status: 404 }
    );
  }

  // Collect all food strings (with day context for better AI grouping)
  const mealFoods = dietMeals
    .filter((m) => m.foods && m.foods.trim())
    .map((m) => `${m.day} - ${m.mealType}: ${m.foods}`);

  if (mealFoods.length === 0) {
    return NextResponse.json(
      { error: "Nessun ingrediente trovato" },
      { status: 404 }
    );
  }

  try {
    const shoppingList = await generateShoppingList(mealFoods);
    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error("Errore generazione lista spesa:", error);
    return NextResponse.json(
      { error: "Errore durante la generazione della lista della spesa." },
      { status: 500 }
    );
  }
}
