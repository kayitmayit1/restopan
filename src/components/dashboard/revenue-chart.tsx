"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type DayData = { createdAt: Date; _sum: { totalAmount: number | null } };

interface RevenueChartProps {
  data: DayData[];
  prevData: DayData[];
}

export function RevenueChart({ data, prevData }: RevenueChartProps) {
  const today = new Date();

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const prevDate = subDays(today, 13 - i);
    const dayKey = format(date, "yyyy-MM-dd");
    const prevKey = format(prevDate, "yyyy-MM-dd");

    const found = data.find(
      (d) => format(new Date(d.createdAt), "yyyy-MM-dd") === dayKey
    );
    const prevFound = prevData.find(
      (d) => format(new Date(d.createdAt), "yyyy-MM-dd") === prevKey
    );

    return {
      day: format(date, "EEE", { locale: tr }),
      date: format(date, "d MMM", { locale: tr }),
      revenue: found?._sum.totalAmount ?? 0,
      prevRevenue: prevFound?._sum.totalAmount ?? 0,
      isToday: i === 6,
    };
  });

  const totalCurrent = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalPrev = chartData.reduce((s, d) => s + d.prevRevenue, 0);
  const pctChange =
    totalPrev === 0
      ? null
      : ((totalCurrent - totalPrev) / totalPrev) * 100;

  const dailyAvg = totalCurrent / 7;
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  const TrendIcon =
    pctChange === null ? Minus : pctChange >= 0 ? TrendingUp : TrendingDown;
  const trendColor =
    pctChange === null
      ? "text-muted-foreground"
      : pctChange >= 0
      ? "text-emerald-600"
      : "text-red-500";

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          {/* Sol: Başlık + Toplam */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Son 7 Günlük Ciro</p>
            <p className="text-3xl font-bold tracking-tight">
              ₺{totalCurrent.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
            </p>
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              {pctChange === null ? (
                <span className="text-muted-foreground text-xs">Karşılaştırma verisi yok</span>
              ) : (
                <span>
                  {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}% geçen haftaya göre
                </span>
              )}
            </div>
          </div>

          {/* Sağ: İstatistikler */}
          <div className="flex gap-6 text-right shrink-0">
            <div>
              <p className="text-xs text-muted-foreground">Günlük ort.</p>
              <p className="text-base font-semibold">
                ₺{dailyAvg.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
              </p>
            </div>
            {totalPrev > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Önceki hafta</p>
                <p className="text-base font-semibold text-muted-foreground">
                  ₺{totalPrev.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={chartData} margin={{ left: 4, right: 4, top: 8, bottom: 0 }} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="revenue" radius={[5, 5, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.isToday
                      ? "hsl(var(--primary))"
                      : entry.revenue === maxRevenue && maxRevenue > 0
                      ? "hsl(var(--primary) / 0.75)"
                      : "hsl(var(--primary) / 0.3)"
                  }
                />
              ))}
            </Bar>
            {totalPrev > 0 && (
              <Line
                type="monotone"
                dataKey="prevRevenue"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
                activeDot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Alt: Tarihler + Legend */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex w-full">
            {chartData.map((d, i) => (
              <span
                key={i}
                className={`text-[10px] w-full text-center ${
                  d.isToday
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {d.date}
              </span>
            ))}
          </div>
        </div>

        {totalPrev > 0 && (
          <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground border-t pt-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0.5 rounded" style={{ background: "hsl(var(--primary))" }} />
              Bu hafta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 border-t border-dashed border-muted-foreground" />
              Geçen hafta
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
