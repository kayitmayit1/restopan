import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await db.tableRequest.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: "PENDING",
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(requests);
}
