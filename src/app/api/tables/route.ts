import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { checkLimit, limitError } from "@/lib/plan-limits-server";

const createSchema = z.object({
  locationId: z.string(),
  name: z.string().min(1),
  capacity: z.number().min(1).default(4),
  section: z.string().optional().nullable(),
  shape: z.enum(["RECTANGLE", "CIRCLE", "SQUARE"]).default("RECTANGLE"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const orgId = session.user.organizationId;
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const check = await checkLimit(orgId, "tables");
    if (!check.allowed) {
      return NextResponse.json(limitError("tables", check.limit, check.plan), { status: 403 });
    }

    const table = await db.table.create({ data });
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("[TABLES POST]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
