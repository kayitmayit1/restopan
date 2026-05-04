import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import { hasFeature } from "@/lib/plan-limits";

export async function POST(req: NextRequest) {
  try {
    const { organizationId, tableId, tableName, type, paymentMethod } = await req.json();

    if (!organizationId || !type) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });

    if (!org || !hasFeature(org.plan as Parameters<typeof hasFeature>[0], "table-requests")) {
      return NextResponse.json({ error: "Bu özellik mevcut planınızda bulunmuyor" }, { status: 403 });
    }

    const request = await db.tableRequest.create({
      data: { organizationId, tableId, tableName, type, paymentMethod },
    });

    broadcast(organizationId, "table:request", {
      id: request.id,
      tableId,
      tableName,
      type,
      paymentMethod,
      createdAt: request.createdAt,
    });

    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    console.error("[public/table-requests POST]", err);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
