"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, calcPercentChange } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  LayoutGrid,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsProps {
  todayRevenue: number;
  todayOrderCount: number;
  yesterdayRevenue: number;
  yesterdayOrderCount: number;
  activeOrders: number;
  tableCount: number;
  occupiedTables: number;
}

export function DashboardStats({
  todayRevenue,
  todayOrderCount,
  yesterdayRevenue,
  yesterdayOrderCount,
  activeOrders,
  tableCount,
  occupiedTables,
}: StatsProps) {
  const revenueChange = calcPercentChange(todayRevenue, yesterdayRevenue);
  const orderChange = calcPercentChange(todayOrderCount, yesterdayOrderCount);
  const occupancyRate = tableCount > 0 ? (occupiedTables / tableCount) * 100 : 0;

  const stats = [
    {
      label: "Bugünkü Ciro",
      value: formatCurrency(todayRevenue),
      change: revenueChange,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Toplam Sipariş",
      value: todayOrderCount.toString(),
      change: orderChange,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Aktif Sipariş",
      value: activeOrders.toString(),
      change: null,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Masa Doluluk",
      value: `${occupiedTables}/${tableCount}`,
      change: null,
      extra: `%${occupancyRate.toFixed(0)}`,
      icon: LayoutGrid,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                {stat.change !== null && stat.change !== undefined ? (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      stat.change >= 0 ? "text-emerald-600" : "text-red-500"
                    )}
                  >
                    {stat.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    %{Math.abs(stat.change).toFixed(1)} dünden
                  </div>
                ) : stat.extra ? (
                  <p className="text-xs text-muted-foreground">{stat.extra} dolu</p>
                ) : null}
              </div>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  stat.color
                )}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
