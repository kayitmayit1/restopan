"use client";

import { useEffect, useState } from "react";
import { X, Phone, Mail, Star, ShoppingBag, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisitAt?: Date | null;
  tags: string[];
  createdAt: Date;
  _count: { orders: number; reservations: number };
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{ menuItem: { name: string }; quantity: number }>;
}

export function CustomerDetailModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${customer.id}/orders`)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [customer.id]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{customer.name}</h2>
              <p className="text-xs text-muted-foreground">
                Kayıt: {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Contact */}
          <div className="space-y-2">
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-muted-foreground" />
                {customer.phone}
              </a>
            )}
            {customer.email && (
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {customer.email}
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShoppingBag, label: "Sipariş", value: customer._count.orders },
              { icon: TrendingUp, label: "Harcama", value: formatCurrency(customer.totalSpent) },
              { icon: Star, label: "Puan", value: customer.loyaltyPoints },
            ].map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center">
                <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {customer.lastVisitAt && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Son ziyaret: {formatDate(customer.lastVisitAt)}
            </p>
          )}

          {customer.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {customer.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Order history */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Sipariş Geçmişi
            </p>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Sipariş bulunamadı</p>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold">{order.orderNumber}</span>
                      <span className="font-bold text-sm text-primary">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.items.slice(0, 3).map((i) => `${i.quantity}× ${i.menuItem.name}`).join(", ")}
                      {order.items.length > 3 && ` +${order.items.length - 3}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(new Date(order.createdAt))}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
