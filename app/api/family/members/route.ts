import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { familyShares } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { findUserByEmail } from "@/lib/db/auth-users";

// People I (the diet owner) have invited to view my diet.
export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const members = await db
    .select()
    .from(familyShares)
    .where(eq(familyShares.ownerUserId, session.data.user.id))
    .orderBy(familyShares.createdAt);

  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { email } = body as { email: string };

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email obbligatoria." }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json(
      { error: "Nessun utente trovato con questa email." },
      { status: 404 }
    );
  }

  const memberUserId = user.id;

  if (memberUserId === session.data.user.id) {
    return NextResponse.json(
      { error: "Non puoi condividere la dieta con te stesso." },
      { status: 400 }
    );
  }

  const memberName = user.name;

  const existing = await db
    .select()
    .from(familyShares)
    .where(
      sql`${familyShares.ownerUserId} = ${session.data.user.id} AND ${familyShares.memberUserId} = ${memberUserId}`
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Persona già invitata." },
      { status: 409 }
    );
  }

  const [share] = await db
    .insert(familyShares)
    .values({
      ownerUserId: session.data.user.id,
      memberUserId,
      memberEmail: user.email,
      memberName,
    })
    .returning();

  return NextResponse.json(share, { status: 201 });
}
