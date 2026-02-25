import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { userGoals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DEFAULTS = {
  dailyKcal: 2000,
  dailyCarbs: 250,
  dailyFats: 65,
  dailyProteins: 75,
  dailyWater: 8,
};

export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const [row] = await db
    .select()
    .from(userGoals)
    .where(eq(userGoals.userId, session.data.user.id));

  return NextResponse.json(row ?? { ...DEFAULTS, userId: session.data.user.id });
}

export async function PUT(req: Request) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { dailyKcal, dailyCarbs, dailyFats, dailyProteins, dailyWater } = body;

  const values = {
    userId: session.data.user.id,
    dailyKcal: dailyKcal ?? DEFAULTS.dailyKcal,
    dailyCarbs: dailyCarbs ?? DEFAULTS.dailyCarbs,
    dailyFats: dailyFats ?? DEFAULTS.dailyFats,
    dailyProteins: dailyProteins ?? DEFAULTS.dailyProteins,
    dailyWater: dailyWater ?? DEFAULTS.dailyWater,
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select()
    .from(userGoals)
    .where(eq(userGoals.userId, session.data.user.id));

  let result;
  if (existing) {
    [result] = await db
      .update(userGoals)
      .set(values)
      .where(eq(userGoals.userId, session.data.user.id))
      .returning();
  } else {
    [result] = await db.insert(userGoals).values(values).returning();
  }

  return NextResponse.json(result);
}
