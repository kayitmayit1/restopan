import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkLimit, limitError } from "@/lib/plan-limits-server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId, name, address, phone, email } = await req.json();

  const check = await checkLimit(organizationId, "locations");
  if (!check.allowed) {
    return NextResponse.json(limitError("locations", check.limit, check.plan), { status: 403 });
  }

  const location = await db.location.create({ data: { organizationId, name, address, phone, email } });
  return NextResponse.json(location, { status: 201 });
}
