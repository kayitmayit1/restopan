import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { addDays } from "date-fns";

const SUPER_ADMIN_EMAIL = "ince.htce@gmail.com";

async function guardAdmin() {
  const session = await auth();
  if (session?.user?.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardAdmin();
  if (guard) return guard;

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  const org = await db.organization.findUnique({ where: { id } });
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "change_plan") {
    const { plan } = body as { plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" };

    await db.organization.update({ where: { id }, data: { plan } });

    const existing = await db.subscription.findFirst({
      where: { organizationId: id },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const periodEnd = addDays(now, 30);

    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    } else {
      await db.subscription.create({
        data: {
          organizationId: id,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "extend_trial") {
    const { days } = body as { days: number };

    const existing = await db.subscription.findFirst({
      where: { organizationId: id },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const base = existing?.currentPeriodEnd
      ? existing.currentPeriodEnd > now
        ? existing.currentPeriodEnd
        : now
      : now;

    const newEnd = addDays(base, days);

    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: { status: "TRIALING", currentPeriodEnd: newEnd },
      });
    } else {
      await db.subscription.create({
        data: {
          organizationId: id,
          status: "TRIALING",
          currentPeriodStart: now,
          currentPeriodEnd: newEnd,
        },
      });
    }

    return NextResponse.json({ ok: true });
  }

  if (action === "cancel") {
    const existing = await db.subscription.findFirst({
      where: { organizationId: id },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      await db.subscription.update({
        where: { id: existing.id },
        data: { status: "CANCELED" },
      });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
