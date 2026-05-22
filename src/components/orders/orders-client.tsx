"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import { OrderStatus, PaymentStatus, OrderType, OrderSource } from "@prisma/client";
import { Search, Eye, RefreshCw } from "lucide-react";
import { OrderDetailModal } from "./order-detail-modal";
import { useRouter } from "next/navigation";
import { useOrderSound } from "@/hooks/use-order-sound";

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Bekliyor", variant: "outline" },
  CONFIRMED: { label: "Onaylandı", variant: "secondary" },
  PREPARING: { label: "Hazırlanıyor", variant: "default" },
  READY: { label: "Hazır", variant: "default" },
  SERVED: { label: "Servis Edildi", variant: "secondary" },
  COMPLETED: { label: "Tamamlandı", variant: "secondary" },
  CANCELLED: { label: "İptal", variant: "destructive" },
};

const paymentConfig: Record<PaymentStatus, { label: string; color: string }> = {
  UNPAID: { label: "Ödenmedi", color: "text-red-600" },
  PARTIAL: { label: "Kısmi", color: "text-amber-600" },
  PAID: { label: "Ödendi", color: "text-emerald-600" },
  REFUNDED: { label: "İade", color: "text-blue-600" },
};

const typeLabels: Record<OrderType, string> = {
  DINE_IN: "Masada",
  TAKEOUT: "Paket",
  DELIVERY: "Kurye",
  ONLINE: "Online",
};

interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  source: OrderSource;
  totalAmount: number;
  createdAt: Date;
  table: { name: string } | null;
  customer: { name: string; phone?: string | null } | null;
  items: Array<{ menuItem: { name: string } }>;
  receipt: { payments: Array<{ method: string; amount: number }> } | null;
  deliveryName?: string | null;
  deliveryPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryFee?: number | null;
}

export function OrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useOrderSound(true);

  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource("/api/events");
      es.onmessage = (e) => {
        try {
          const { event, data } = JSON.parse(e.data);
          if (event === "order:new") {
            router.refresh();
          }
          if (event === "order:updated") {
            setOrders((prev) => prev.map((o) => o.id === data.id ? { ...o, status: data.status as OrderStatus } : o));
            setSelectedOrder((prev) => prev?.id === data.id && prev ? { ...prev, status: data.status as OrderStatus } : prev);
          }
        } catch { /* ignore parse errors */ }
      };
      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => { es?.close(); clearTimeout(retryTimeout); };
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.table?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    revenue: orders.filter((o) => o.paymentStatus === "PAID").reduce((s, o) => s + o.totalAmount, 0),
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Toplam Sipariş", value: stats.total, color: "" },
          { label: "Aktif", value: stats.active, color: "text-amber-600" },
          { label: "Tamamlanan", value: stats.completed, color: "text-emerald-600" },
          { label: "Ciro", value: formatCurrency(stats.revenue), color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-0.5", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Sipariş no, masa, müşteri ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              statusFilter === "ALL" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Tümü
          </button>
          {Object.entries(statusConfig).map(([s, cfg]) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as OrderStatus)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                statusFilter === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cfg.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => router.refresh()} className="flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/8 border-b border-primary/15">
            <tr>
              {["Sipariş No", "Masa/Tür", "Ürünler", "Durum", "Ödeme", "Tutar", "Tarih", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-primary/80 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-muted-foreground">
                  Sipariş bulunamadı
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const sc = statusConfig[order.status];
                const pc = paymentConfig[order.paymentStatus];
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {order.table && <p className="font-medium">{order.table.name}</p>}
                        {(order.type === "DELIVERY" || (order.source === "ONLINE" && order.type === "TAKEOUT")) && order.deliveryName && (
                          <p className="font-medium text-orange-700">{order.deliveryName}</p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs text-muted-foreground">{typeLabels[order.type]}</p>
                          {order.source === "ONLINE" && (
                            <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">QR</span>
                          )}
                        </div>
                        {order.type === "DELIVERY" && order.deliveryAddress && (
                          <p className="text-xs text-muted-foreground truncate max-w-32">{order.deliveryAddress}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-48">
                      <p className="text-xs text-muted-foreground truncate">
                        {order.items.slice(0, 2).map((i) => i.menuItem.name).join(", ")}
                        {order.items.length > 2 && ` +${order.items.length - 2}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium", pc.color)}>{pc.label}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => {
            setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
            setSelectedOrder((prev) => prev?.id === id ? { ...prev, status } : prev);
          }}
        />
      )}
    </div>
  );
}
