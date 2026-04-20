import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") || new Date().toISOString();
  const date = new Date(dateStr);

  const locationFilter = session.user.locationId
    ? { locationId: session.user.locationId }
    : { location: { organizationId: session.user.organizationId } };

  const [orders, expenses] = await Promise.all([
    db.order.findMany({
      where: {
        ...locationFilter,
        createdAt: { gte: startOfDay(date), lte: endOfDay(date) },
        status: { not: "CANCELLED" },
        paymentStatus: "PAID",
      },
      include: {
        receipt: { include: { payments: true } },
      },
    }),
    db.expense.findMany({
      where: {
        ...(session.user.locationId ? { locationId: session.user.locationId } : { location: { organizationId: session.user.organizationId } }),
        date: { gte: startOfDay(date), lte: endOfDay(date) },
      },
    }),
  ]);

  const paymentBreakdown: Record<string, number> = {};
  let grossRevenue = 0;

  for (const order of orders) {
    grossRevenue += order.totalAmount;
    for (const payment of order.receipt?.payments ?? []) {
      paymentBreakdown[payment.method] =
        (paymentBreakdown[payment.method] ?? 0) + payment.amount;
    }
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return NextResponse.json({
    date: date.toISOString(),
    orderCount: orders.length,
    grossRevenue,
    totalExpenses,
    netRevenue: grossRevenue - totalExpenses,
    paymentBreakdown,
    expenses,
  });
}
