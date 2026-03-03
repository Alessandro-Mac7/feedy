import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { verifyNutritionist } from "@/lib/auth/nutritionist";

export async function GET() {
  const session = await auth.getSession();
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const nutritionist = await verifyNutritionist(session);

  if (!nutritionist) {
    return NextResponse.json({ isNutritionist: false });
  }

  return NextResponse.json({
    isNutritionist: true,
    nutritionist,
  });
}
