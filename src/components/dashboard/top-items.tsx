"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface TopItem {
  menuItemId: string;
  _sum: { quantity: number | null; totalPrice: number | null };
  menuItem?: { id: string; name: string; price: number } | null;
}

export function TopItems({ items }: { items: TopItem[] }) {
  const maxRevenue = Math.max(...items.map((i) => i._sum.totalPrice ?? 0), 1);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          En Çok Satan (7 Gün)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Veri bulunamadı
          </p>
        ) : (
          items.map((item, idx) => {
            const revenue = item._sum.totalPrice ?? 0;
            const qty = item._sum.quantity ?? 0;
            const pct = (revenue / maxRevenue) * 100;
            return (
              <div key={item.menuItemId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium truncate max-w-32">
                      {item.menuItem?.name ?? "—"}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-xs">
                      {formatCurrency(revenue)}
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">
                      ({qty} adet)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
