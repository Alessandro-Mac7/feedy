import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { diets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createDietWithMeals } from "@/lib/db/create-diet";
import type { ParsedMeal } from "@/types";

export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const userDiets = await db
    .select()
    .from(diets)
    .where(eq(diets.userId, session.data.user.id))
    .orderBy(desc(diets.createdAt));

  return NextResponse.json(userDiets);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { name, startDate, endDate, parsedMeals } = body as {
    name: string;
    startDate: string;
    endDate: string;
    parsedMeals: ParsedMeal[];
  };

  if (!name || !startDate || !endDate || !parsedMeals?.length) {
    return NextResponse.json(
      { error: "Dati mancanti: nome, date e pasti sono obbligatori." },
      { status: 400 }
    );
  }

  const diet = await createDietWithMeals({
    userId: session.data.user.id,
    name,
    startDate,
    endDate,
    parsedMeals,
  });

  return NextResponse.json(diet, { status: 201 });
}
