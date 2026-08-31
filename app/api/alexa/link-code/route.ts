import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { alexaLinkCodes, alexaLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const CODE_TTL_MS = 10 * 60 * 1000;

function generateCode(): string {
  // Avoid a leading zero: AMAZON.NUMBER can drop it when parsing speech.
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const [link] = await db
    .select()
    .from(alexaLinks)
    .where(eq(alexaLinks.userId, session.data.user.id))
    .limit(1);

  return NextResponse.json({ linked: !!link });
}

export async function POST() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Only one active code per user at a time.
  await db.delete(alexaLinkCodes).where(eq(alexaLinkCodes.userId, session.data.user.id));

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await db.insert(alexaLinkCodes).values({ userId: session.data.user.id, code, expiresAt });

  return NextResponse.json({ code, expiresAt });
}

export async function DELETE() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  await db.delete(alexaLinks).where(eq(alexaLinks.userId, session.data.user.id));

  return NextResponse.json({ ok: true });
}
