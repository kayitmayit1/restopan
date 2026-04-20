"use client";

import { usePOSStore } from "@/store/pos";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Tag,
  ChevronDown,
  ArrowRightLeft,
} from "lucide-react";
import { TableStatus } from "@prisma/client";
import { useState } from "react";

interface Table {
  id: string;
  name: string;
  status: TableStatus;
}

interface CartPanelProps {
  onCheckout: () => void;
  onTableSelect: () => void;
  onTransfer?: () => void;
  tables: Table[];
  activeOrderId?: string;
}

export function CartPanel({ onCheckout, onTableSelect, onTransfer, tables, activeOrderId }: CartPanelProps) {
  const {
    cart,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    total,
    discount,
    discountType,
    setDiscount,
    selectedTableId,
    orderType,
    notes,
    setNotes,
  } = usePOSStore();

  const [showDiscount, setShowDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState(discount.toString());

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const sub = subtotal();
  const disc = discountAmount();
  const tot = total();
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  function applyDiscount() {
    const val = parseFloat(discountInput) || 0;
    setDiscount(val, discountType);
    setShowDiscount(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Sipariş</span>
          {itemCount > 0 && (
            <Badge className="text-xs h-5 px-1.5">{itemCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {orderType === "DINE_IN" && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={onTableSelect} className="h-7 text-xs">
                {selectedTable ? selectedTable.name : "Masa Seç"}
              </Button>
              {selectedTable && activeOrderId && onTransfer && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onTransfer} title="Masa Aktar">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
          {cart.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={clearCart}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 p-6">
            <ShoppingCart className="w-14 h-14 opacity-10" />
            <p className="text-sm font-medium">Sepet boş</p>
            <p className="text-xs text-center">
              Sipariş eklemek için menüden ürün seçin
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {cart.map((item) => (
              <div key={item.id} className="px-4 py-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {item.modifiers.map((m) => m.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold">
                    {formatCurrency(
                      (item.unitPrice +
                        item.modifiers.reduce((s, m) => s + m.price, 0)) *
                        item.quantity
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Totals & Actions */}
      {cart.length > 0 && (
        <div className="border-t p-4 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Ara Toplam</span>
              <span>{formatCurrency(sub)}</span>
            </div>
            {disc > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>İndirim</span>
                <span>-{formatCurrency(disc)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Toplam</span>
              <span className="text-primary">{formatCurrency(tot)}</span>
            </div>
          </div>

          {/* Discount Toggle */}
          <button
            onClick={() => setShowDiscount(!showDiscount)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <Tag className="w-3 h-3" />
            İndirim Ekle
            <ChevronDown
              className={cn(
                "w-3 h-3 ml-auto transition-transform",
                showDiscount && "rotate-180"
              )}
            />
          </button>

          {showDiscount && (
            <div className="flex gap-2">
              <Input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="0"
                className="h-8 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDiscount(
                    parseFloat(discountInput) || 0,
                    discountType === "PERCENTAGE" ? "FIXED" : "PERCENTAGE"
                  )
                }
                className="h-8 text-xs px-2 flex-shrink-0"
              >
                {discountType === "PERCENTAGE" ? "%" : "₺"}
              </Button>
              <Button
                size="sm"
                onClick={applyDiscount}
                className="h-8 text-xs flex-shrink-0"
              >
                Uygula
              </Button>
            </div>
          )}

          {/* Notes */}
          <Input
            placeholder="Sipariş notu..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8 text-xs"
          />

          <Button
            onClick={onCheckout}
            className="w-full h-11 text-base font-semibold"
            disabled={cart.length === 0}
          >
            Ödeme Al · {formatCurrency(tot)}
          </Button>
        </div>
      )}
    </div>
  );
}
