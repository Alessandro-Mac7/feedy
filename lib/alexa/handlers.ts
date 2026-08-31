import { db } from "@/lib/db";
import { alexaLinks, alexaLinkCodes, diets, meals, familyShares } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { authUserNameSql } from "@/lib/db/auth-users";
import { MEAL_TYPES, type Day, type MealType, type Meal } from "@/types";

export const MEAL_TYPE_BY_SPOKEN: Record<string, MealType> = {
  colazione: "Colazione",
  "spuntino della mattina": "Spuntino Mattina",
  "spuntino del mattino": "Spuntino Mattina",
  "spuntino mattina": "Spuntino Mattina",
  pranzo: "Pranzo",
  "spuntino del pomeriggio": "Spuntino Pomeriggio",
  "spuntino pomeriggio": "Spuntino Pomeriggio",
  cena: "Cena",
};

export async function findLinkedUserId(alexaUserId: string): Promise<string | null> {
  const [link] = await db
    .select()
    .from(alexaLinks)
    .where(eq(alexaLinks.alexaUserId, alexaUserId))
    .limit(1);
  return link?.userId ?? null;
}

export async function linkAccount(alexaUserId: string, code: string | undefined): Promise<string> {
  if (!code) return "Non ho capito il codice, puoi ripeterlo?";

  const [row] = await db
    .select()
    .from(alexaLinkCodes)
    .where(and(eq(alexaLinkCodes.code, code), gt(alexaLinkCodes.expiresAt, new Date())))
    .limit(1);

  if (!row) return "Il codice non è valido o è scaduto. Generane uno nuovo dalle impostazioni di Feedy.";

  await db
    .insert(alexaLinks)
    .values({ alexaUserId, userId: row.userId })
    .onConflictDoUpdate({ target: alexaLinks.alexaUserId, set: { userId: row.userId } });
  await db.delete(alexaLinkCodes).where(eq(alexaLinkCodes.id, row.id));

  return "Account collegato! Ora puoi chiedermi cosa devi mangiare.";
}

async function getActiveDietMeals(userId: string): Promise<Meal[]> {
  const [diet] = await db
    .select()
    .from(diets)
    .where(and(eq(diets.userId, userId), eq(diets.isActive, true)))
    .limit(1);
  if (!diet) return [];
  return db.select().from(meals).where(eq(meals.dietId, diet.id));
}

function speakMeals(dayMeals: Meal[], day: Day, mealType?: MealType): string {
  const filtered = mealType ? dayMeals.filter((m) => m.mealType === mealType) : dayMeals;
  if (filtered.length === 0) {
    return mealType
      ? `non hai nulla in programma per ${mealType.toLowerCase()} ${day.toLowerCase()}.`
      : `non hai nessun pasto in programma per ${day.toLowerCase()}.`;
  }
  const ordered = [...filtered].sort(
    (a, b) => MEAL_TYPES.indexOf(a.mealType as MealType) - MEAL_TYPES.indexOf(b.mealType as MealType)
  );
  return ordered.map((m) => `a ${m.mealType.toLowerCase()}: ${m.foods}.`).join(" ");
}

export async function describeMyMeals(userId: string, day: Day, mealType?: MealType): Promise<string> {
  const dayMeals = (await getActiveDietMeals(userId)).filter((m) => m.day === day);
  return `Per ${day}, ${speakMeals(dayMeals, day, mealType)}`;
}

function nameMatches(candidate: string | null, spoken: string): boolean {
  if (!candidate) return false;
  const c = candidate.toLowerCase().trim();
  const s = spoken.toLowerCase().trim();
  return c === s || c.startsWith(s) || c.split(" ")[0] === s;
}

async function resolveFamilyOwner(viewerUserId: string, spokenName: string) {
  const shares = await db
    .select({
      ownerUserId: familyShares.ownerUserId,
      ownerName: authUserNameSql(familyShares.ownerUserId),
    })
    .from(familyShares)
    .where(and(eq(familyShares.memberUserId, viewerUserId), eq(familyShares.confirmed, true)));

  return shares.find((s) => nameMatches(s.ownerName, spokenName)) ?? null;
}

export async function describePersonMeals(
  viewerUserId: string,
  spokenName: string,
  day: Day,
  mealType?: MealType
): Promise<string> {
  const owner = await resolveFamilyOwner(viewerUserId, spokenName);
  if (!owner) return `Non trovo nessuno di nome ${spokenName} che condivide la dieta con te.`;

  const label = owner.ownerName ?? spokenName;
  const dayMeals = (await getActiveDietMeals(owner.ownerUserId)).filter((m) => m.day === day);
  if (dayMeals.length === 0) return `${label} non ha una dieta attiva.`;

  return `${label}, per ${day}, ${speakMeals(dayMeals, day, mealType)}`;
}
