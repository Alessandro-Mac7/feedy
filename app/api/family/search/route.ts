import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { searchUsers } from "@/lib/db/auth-users";

export async function GET(req: NextRequest) {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await searchUsers(q, session.data.user.id);

  return NextResponse.json(results);
}
