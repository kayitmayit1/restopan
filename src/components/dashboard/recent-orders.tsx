"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTime } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Bekliyor", variant: "outline" },
  CONFIRMED: { label: "Onaylandı", variant: "secondary" },
  PREPARING: { label: "Hazırlanıyor", variant: "default" },
  READY: { label: "Hazır", variant: "default" },
  SERVED: { label: "Servis Edildi", variant: "secondary" },
  COMPLETED: { label: "Tamamlandı", variant: "secondary" },
  CANCELLED: { label: "İptal", variant: "destructive" },
};

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  table: { name: string } | null;
  items: Array<{ menuItem: { name: string } }>;
}

export function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Son Siparişler</CardTitle>
        <Link href="/dashboard/siparisler" className="inline-flex items-center gap-1 text-xs h-7 px-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          Tümü <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {orders.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Henüz sipariş yok
            </p>
          ) : (
            orders.map((order) => {
              const cfg = statusConfig[order.status];
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {order.orderNumber}
                        </span>
                        {order.table && (
                          <span className="text-xs text-muted-foreground">
                            {order.table.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-56">
                        {order.items
                          .slice(0, 2)
                          .map((i) => i.menuItem.name)
                          .join(", ")}
                        {order.items.length > 2 &&
                          ` +${order.items.length - 2}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={cfg.variant} className="text-xs">
                      {cfg.label}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
