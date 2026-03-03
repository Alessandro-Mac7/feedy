import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.getSession();
  const nutritionist = await verifyNutritionist(session);
  if (!nutritionist) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results = await db.execute(
    sql`SELECT id, email, name FROM "neon_auth"."user" WHERE LOWER(email) LIKE ${"%" + q + "%"} OR LOWER(name) LIKE ${"%" + q + "%"} ORDER BY name ASC LIMIT 10`
  );

  return NextResponse.json(
    results.rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
    }))
  );
}
