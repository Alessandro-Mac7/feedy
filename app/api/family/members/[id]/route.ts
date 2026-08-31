import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { familyShares } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const [share] = await db
    .select()
    .from(familyShares)
    .where(
      and(
        eq(familyShares.id, id),
        eq(familyShares.ownerUserId, session.data.user.id)
      )
    )
    .limit(1);

  if (!share) {
    return NextResponse.json({ error: "Condivisione non trovata." }, { status: 404 });
  }

  await db.delete(familyShares).where(eq(familyShares.id, id));

  return NextResponse.json({ ok: true });
}
