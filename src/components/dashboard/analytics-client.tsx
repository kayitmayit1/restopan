"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

const ORDER_TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Masada", TAKEOUT: "Paket", DELIVERY: "Kurye", ONLINE: "Online",
};
const METHOD_LABELS: Record<string, string> = {
  CASH: "Nakit", CREDIT_CARD: "Kredi Kartı", DEBIT_CARD: "Banka Kartı",
  GIFT_CARD: "Hediye Kartı", ONLINE: "Online", BANK_TRANSFER: "Banka Transferi",
};
const COLORS = ["#e55a2b", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

interface AnalyticsClientProps {
  revenueByDay: Array<{ createdAt: Date; _sum: { totalAmount: number | null }; _count: number }>;
  ordersByType: Array<{ type: string; _sum: { totalAmount: number | null }; _count: number }>;
  ordersRaw: Array<{ createdAt: Date; totalAmount: number }>;
  topItems: Array<{ menuItemId: string; name: string; _sum: { quantity: number | null; totalPrice: number | null } }>;
  paymentMethods: Array<{ method: string; _sum: { amount: number | null }; _count: number }>;
  customerStats: { _count: number; _avg: { totalSpent: number | null }; _sum: { loyaltyPoints: number | null } };
}

export function AnalyticsClient({
  revenueByDay, ordersByType, ordersRaw, topItems, paymentMethods, customerStats,
}: AnalyticsClientProps) {
  const today = new Date();

  // Last 30 days revenue
  const revenueChartData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const key = format(date, "yyyy-MM-dd");
    const found = revenueByDay.find((d) => format(new Date(d.createdAt), "yyyy-MM-dd") === key);
    return {
      date: format(date, "d MMM", { locale: tr }),
      revenue: found?._sum.totalAmount ?? 0,
      orders: found?._count ?? 0,
    };
  });

  // Orders by hour
  const hourData = Array.from({ length: 24 }, (_, h) => {
    const orders = ordersRaw.filter((o) => new Date(o.createdAt).getHours() === h);
    return {
      hour: `${h.toString().padStart(2, "0")}:00`,
      orders: orders.length,
      revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
    };
  });

  const typeData = ordersByType.map((t) => ({
    name: ORDER_TYPE_LABELS[t.type] || t.type,
    value: t._sum.totalAmount ?? 0,
    count: t._count,
  }));

  const methodData = paymentMethods.map((m) => ({
    name: METHOD_LABELS[m.method] || m.method,
    value: m._sum.amount ?? 0,
    count: m._count,
  }));

  const totalRevenue = revenueChartData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueChartData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "30 Günlük Ciro", value: formatCurrency(totalRevenue) },
          { label: "Toplam Sipariş", value: totalOrders.toString() },
          { label: "Ort. Sipariş Değeri", value: formatCurrency(avgOrderValue) },
          { label: "Toplam Müşteri", value: customerStats._count.toString() },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue 30 days */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">30 Günlük Ciro Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                interval={4} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <Tooltip formatter={(v) => [formatCurrency(v as number), "Ciro"]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))"
                strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak hours */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Yoğunluk Saatleri</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourData.filter((h) => h.orders > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" name="Sipariş" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order types */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sipariş Türleri</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v as number)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {typeData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">En Çok Satan 10 Ürün (30 Gün)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topItems.map((i) => ({ name: i.name, revenue: i._sum.totalPrice ?? 0, qty: i._sum.quantity ?? 0 }))}
              layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [formatCurrency(v as number), "Ciro"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ödeme Yöntemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {methodData.map((m, i) => {
              const total = methodData.reduce((s, x) => s + x.value, 0);
              const pct = total > 0 ? (m.value / total) * 100 : 0;
              return (
                <div key={m.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{m.name}</span>
                    <span className="font-semibold">{formatCurrency(m.value)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
