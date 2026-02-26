import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets, meals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateShoppingList } from "@/lib/groq/shopping-list";

const DAYS_ORDER = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
] as const;

/** Returns the Italian day names from today through Sunday.
 *  If today is Sunday, returns the full week (Mon–Sun). */
function getRemainingDays(): string[] {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ...
  if (jsDay === 0) return [...DAYS_ORDER]; // Sunday → full week
  const idx = jsDay - 1; // 0=Lunedì, ..., 5=Sabato
  return DAYS_ORDER.slice(idx) as unknown as string[];
}

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
  const allMeals = await db
    .select()
    .from(meals)
    .where(eq(meals.dietId, activeDiet.id));

  if (allMeals.length === 0) {
    return NextResponse.json(
      { error: "Nessun pasto trovato" },
      { status: 404 }
    );
  }

  // Only include meals from today through Sunday
  const remainingDays = new Set(getRemainingDays());
  const dietMeals = allMeals.filter((m) => remainingDays.has(m.day));

  if (dietMeals.length === 0) {
    return NextResponse.json(
      { error: "Nessun pasto trovato per i giorni rimanenti" },
      { status: 404 }
    );
  }

  // Collect food strings (with day context for better AI grouping)
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
