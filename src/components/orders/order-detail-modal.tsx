"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Printer } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { OrderStatus, PaymentStatus, OrderType } from "@prisma/client";

interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  notes?: string | null;
  createdAt: Date;
  table: { name: string } | null;
  customer: { name: string; phone?: string | null } | null;
  items: Array<{
    quantity?: number;
    unitPrice?: number;
    menuItem: { name: string };
  }>;
  receipt: {
    payments: Array<{ method: string; amount: number }>;
  } | null;
}

const methodLabels: Record<string, string> = {
  CASH: "Nakit",
  CREDIT_CARD: "Kredi Kartı",
  DEBIT_CARD: "Banka Kartı",
  GIFT_CARD: "Hediye Kartı",
  ONLINE: "Online",
};

export function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-semibold">{order.orderNumber}</h2>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Printer className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Tür</p>
              <p className="font-medium">
                {order.type === "DINE_IN" ? "Masada" : order.type === "TAKEOUT" ? "Paket" : "Kurye"}
              </p>
            </div>
            {order.table && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Masa</p>
                <p className="font-medium">{order.table.name}</p>
              </div>
            )}
            {order.customer && (
              <div className="bg-muted rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Müşteri</p>
                <p className="font-medium">{order.customer.name}</p>
                {order.customer.phone && (
                  <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Ürünler
            </p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>
                    {item.quantity && `${item.quantity}× `}
                    {item.menuItem.name}
                  </span>
                  {item.unitPrice && item.quantity && (
                    <span className="font-medium">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            {order.subtotal !== undefined && (
              <div className="flex justify-between text-muted-foreground">
                <span>Ara Toplam</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
            )}
            {order.taxAmount !== undefined && order.taxAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>KDV</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
            )}
            {order.discountAmount !== undefined && order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>İndirim</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Toplam</span>
              <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Payment */}
          {order.receipt?.payments && order.receipt.payments.length > 0 && (
            <div className="border rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Ödeme Detayı
              </p>
              {order.receipt.payments.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{methodLabels[p.method] || p.method}</span>
                  <span className="font-medium">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {order.notes && (
            <div className="bg-amber-50 rounded-lg p-3 text-sm">
              <p className="text-xs font-semibold text-amber-700 mb-1">Not</p>
              <p className="text-amber-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
