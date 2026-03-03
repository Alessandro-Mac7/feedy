import { db } from "@/lib/db";
import { nutritionists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Nutritionist } from "@/types";

export async function verifyNutritionist(
  session: { data: { user: { id: string } } | null } | null
): Promise<Nutritionist | null> {
  if (!session?.data?.user) return null;

  const [nutritionist] = await db
    .select()
    .from(nutritionists)
    .where(eq(nutritionists.userId, session.data.user.id))
    .limit(1);

  return nutritionist ?? null;
}
