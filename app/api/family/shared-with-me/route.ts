import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { familyShares } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { authUserNameSql, authUserEmailSql } from "@/lib/db/auth-users";

// Diets other people have shared with me.
export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const shares = await db
    .select({
      id: familyShares.id,
      ownerUserId: familyShares.ownerUserId,
      confirmed: familyShares.confirmed,
      createdAt: familyShares.createdAt,
      ownerName: authUserNameSql(familyShares.ownerUserId),
      ownerEmail: authUserEmailSql(familyShares.ownerUserId),
    })
    .from(familyShares)
    .where(eq(familyShares.memberUserId, session.data.user.id))
    .orderBy(familyShares.createdAt);

  return NextResponse.json(shares);
}

export async function PATCH(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const userId = session.data.user.id;
  const id = req.nextUrl.searchParams.get("id");
  const action = req.nextUrl.searchParams.get("action");

  if (!id || !action || !["confirm", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Parametri mancanti: id e action (confirm|reject) richiesti." },
      { status: 400 }
    );
  }

  const [share] = await db
    .select()
    .from(familyShares)
    .where(
      and(eq(familyShares.id, id), eq(familyShares.memberUserId, userId))
    )
    .limit(1);

  if (!share) {
    return NextResponse.json({ error: "Condivisione non trovata." }, { status: 404 });
  }

  if (action === "confirm") {
    await db
      .update(familyShares)
      .set({ confirmed: true })
      .where(eq(familyShares.id, id));
    return NextResponse.json({ ok: true });
  }

  // action === "reject" (also used to leave a share you'd already confirmed)
  await db.delete(familyShares).where(eq(familyShares.id, id));
  return NextResponse.json({ ok: true });
}
