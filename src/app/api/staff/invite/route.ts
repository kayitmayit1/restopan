import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendStaffInvite } from "@/lib/email";
import { z } from "zod";
import { checkLimit, limitError } from "@/lib/plan-limits";

const schema = z.object({
  organizationId: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "CASHIER", "WAITER", "KITCHEN", "STAFF"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const check = await checkLimit(data.organizationId, "members");
  if (!check.allowed) {
    return NextResponse.json(limitError("members", check.limit, check.plan), { status: 403 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await db.organizationInvite.create({
    data: { ...data, expiresAt },
  });

  const organization = await db.organization.findUnique({
    where: { id: data.organizationId },
    select: { name: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  sendStaffInvite({
    to: data.email,
    restaurantName: organization?.name ?? "Restoran",
    role: data.role,
    inviteUrl: `${appUrl}/davet?token=${invite.token}`,
    invitedBy: session.user.name ?? "Yönetici",
  }).catch((e) => console.error("[INVITE_EMAIL]", e));

  return NextResponse.json({ success: true, token: invite.token });
}
