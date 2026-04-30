"use client";

import { useState } from "react";
import { usePOSStore } from "@/store/pos";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  X,
  Banknote,
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle,
  Users,
  SplitSquareHorizontal,
} from "lucide-react";

interface PaymentModalProps {
  onClose: () => void;
  organizationId: string;
  locationId?: string;
  staffId: string;
}

type PaymentMethod = "CASH" | "CREDIT_CARD" | "DEBIT_CARD";

const METHODS = [
  { value: "CASH" as const, label: "Nakit", icon: Banknote },
  { value: "CREDIT_CARD" as const, label: "Kredi Kartı", icon: CreditCard },
  { value: "DEBIT_CARD" as const, label: "Banka Kartı", icon: Smartphone },
];

export function PaymentModal({ onClose, organizationId, locationId, staffId }: PaymentModalProps) {
  const { cart, total, discountAmount, subtotal, selectedTableId, orderType, notes, clearCart, deliveryName, deliveryPhone, deliveryAddress } =
    usePOSStore();

  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Split bill
  const [splitMode, setSplitMode] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [paidParts, setPaidParts] = useState(0);

  const tot = total();
  const perPerson = splitMode ? tot / splitCount : tot;
  const remainingAmount = splitMode ? tot - paidParts * perPerson : tot;

  const cash = parseFloat(cashReceived) || 0;
  const effectiveAmount = splitMode ? perPerson : tot;
  const change = Math.max(0, cash - effectiveAmount);

  const quickAmounts = [
    Math.ceil(effectiveAmount / 10) * 10,
    Math.ceil(effectiveAmount / 50) * 50,
    Math.ceil(effectiveAmount / 100) * 100,
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  async function createOrder(paymentAmount: number) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId,
        organizationId,
        tableId: selectedTableId,
        staffId,
        type: orderType,
        notes,
        deliveryName: orderType === "DELIVERY" ? deliveryName : undefined,
        deliveryPhone: orderType === "DELIVERY" ? deliveryPhone : undefined,
        deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : undefined,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
          modifiers: item.modifiers,
        })),
        subtotal: subtotal(),
        discountAmount: discountAmount(),
        totalAmount: tot,
        payment: { method, amount: paymentAmount },
      }),
    });
    if (!res.ok) throw new Error();
  }

  async function handleComplete() {
    if (method === "CASH" && cash < effectiveAmount) {
      toast.error("Alınan tutar yetersiz");
      return;
    }

    setLoading(true);
    try {
      if (splitMode) {
        const newPaid = paidParts + 1;
        if (newPaid >= splitCount) {
          await createOrder(tot);
          setSuccess(true);
          setTimeout(() => { clearCart(); onClose(); }, 1500);
        } else {
          setPaidParts(newPaid);
          setCashReceived("");
          toast.success(`${newPaid}/${splitCount} ödeme alındı · Kalan: ${formatCurrency(tot - newPaid * perPerson)}`);
        }
      } else {
        await createOrder(tot);
        setSuccess(true);
        setTimeout(() => { clearCart(); onClose(); }, 1500);
      }
    } catch {
      toast.error("Sipariş oluşturulurken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Ödeme Tamamlandı!</h2>
          {method === "CASH" && change > 0 && !splitMode && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Para üstü</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(change)}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Ödeme Al</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 space-y-5">
          {/* Total */}
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {splitMode ? `Kişi başı (${splitCount} kişi)` : "Ödenecek Tutar"}
            </p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(effectiveAmount)}</p>
            {splitMode && (
              <p className="text-xs text-muted-foreground mt-1">
                Toplam: {formatCurrency(tot)} · Kalan: {formatCurrency(remainingAmount)}
              </p>
            )}
          </div>

          {/* Split Bill Toggle */}
          <div className="flex gap-2">
            <Button
              variant={splitMode ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => { setSplitMode(!splitMode); setPaidParts(0); }}
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              Hesabı Böl
            </Button>
          </div>

          {splitMode && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Kişi Sayısı</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => { setSplitCount(Math.max(2, splitCount - 1)); setPaidParts(0); }}
                >−</Button>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xl font-bold">{splitCount}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => { setSplitCount(splitCount + 1); setPaidParts(0); }}
                >+</Button>
              </div>
              {paidParts > 0 && (
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: splitCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${i < paidParts ? "bg-emerald-500" : "bg-muted"}`}
                    />
                  ))}
                </div>
              )}
              <Separator />
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Ödeme Yöntemi
            </p>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    method === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${method === value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${method === value ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Input */}
          {method === "CASH" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Alınan Tutar</p>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="text-lg h-12 text-center font-bold"
                />
              </div>
              <div className="flex gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashReceived(amt.toString())}
                    className="flex-1 h-9 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    ₺{amt}
                  </button>
                ))}
              </div>
              {cash >= effectiveAmount && cash > 0 && (
                <div className="flex justify-between text-sm bg-emerald-50 rounded-lg p-3">
                  <span className="text-emerald-700">Para Üstü</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(change)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">İptal</Button>
          <Button
            onClick={handleComplete}
            className="flex-1 h-11"
            disabled={loading || (method === "CASH" && cash < effectiveAmount && cashReceived !== "")}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {splitMode && paidParts < splitCount - 1
              ? `${paidParts + 1}. Ödemeyi Al`
              : "Tamamla"}
          </Button>
        </div>
      </div>
    </div>
  );
}
