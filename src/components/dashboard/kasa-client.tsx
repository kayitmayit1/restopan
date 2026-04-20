"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Banknote,
  CreditCard,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Receipt,
  Printer,
  CheckCircle2,
} from "lucide-react";

const METHOD_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  CASH: { label: "Nakit", icon: Banknote },
  CREDIT_CARD: { label: "Kredi Kartı", icon: CreditCard },
  DEBIT_CARD: { label: "Banka Kartı", icon: Smartphone },
  ONLINE: { label: "Online", icon: Smartphone },
  GIFT_CARD: { label: "Hediye Kartı", icon: CreditCard },
};

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: Date;
  receipt: { payments: { method: string; amount: number }[] } | null;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
}

interface KasaClientProps {
  orders: Order[];
  expenses: Expense[];
  locationId?: string;
}

export function KasaClient({ orders, expenses, locationId: _locationId }: KasaClientProps) {
  const [cashOnHand, setCashOnHand] = useState("");
  const [closed, setClosed] = useState(false);

  const grossRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netRevenue = grossRevenue - totalExpenses;

  const paymentBreakdown: Record<string, number> = {};
  for (const order of orders) {
    for (const p of order.receipt?.payments ?? []) {
      paymentBreakdown[p.method] = (paymentBreakdown[p.method] ?? 0) + p.amount;
    }
  }

  const expectedCash = paymentBreakdown["CASH"] ?? 0;
  const cashInput = parseFloat(cashOnHand) || 0;
  const cashDiff = cashOnHand !== "" ? cashInput - expectedCash : null;

  function handleClose() {
    if (cashOnHand === "") {
      toast.error("Nakit sayım miktarını girin");
      return;
    }
    setClosed(true);
    toast.success("Kasa kapatıldı", { description: `Net ciro: ${formatCurrency(netRevenue)}` });
  }

  if (closed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold">Kasa Kapatıldı</h2>
        <p className="text-muted-foreground text-sm">Günlük kasa raporu kaydedildi.</p>
        <Button variant="outline" onClick={() => setClosed(false)}>Tekrar Aç</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sol: Özet */}
      <div className="lg:col-span-2 space-y-6">
        {/* KPI kartları */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Brüt Ciro
              </div>
              <p className="text-2xl font-bold">{formatCurrency(grossRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">{orders.length} sipariş</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                Giderler
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-muted-foreground mt-1">{expenses.length} kalem</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Receipt className="w-3.5 h-3.5" />
                Net Ciro
              </div>
              <p className={`text-2xl font-bold ${netRevenue >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(netRevenue)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ödeme yöntemi dağılımı */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ödeme Yöntemi Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(paymentBreakdown).length === 0 ? (
              <p className="text-sm text-muted-foreground">Ödeme yok</p>
            ) : (
              Object.entries(paymentBreakdown).map(([method, amount]) => {
                const { label, icon: Icon } = METHOD_LABELS[method] ?? { label: method, icon: CreditCard };
                const pct = grossRevenue > 0 ? (amount / grossRevenue) * 100 : 0;
                return (
                  <div key={method}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {label}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                        <span className="font-semibold text-sm">{formatCurrency(amount)}</span>
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

        {/* Son siparişler */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Günün Siparişleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Sipariş yok</p>
              ) : orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">{o.orderNumber}</Badge>
                    <span className="text-muted-foreground text-xs">
                      {new Date(o.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span className="font-semibold">{formatCurrency(o.totalAmount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sağ: Kasa Kapanışı */}
      <div className="space-y-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Kasa Kapanışı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Beklenen Nakit</span>
                <span className="font-semibold">{formatCurrency(expectedCash)}</span>
              </div>
              <Separator />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Sayılan Nakit</p>
              <Input
                type="number"
                placeholder="0.00"
                value={cashOnHand}
                onChange={(e) => setCashOnHand(e.target.value)}
                className="text-lg font-bold text-center h-12"
              />
            </div>

            {cashDiff !== null && (
              <div className={`rounded-lg p-3 text-sm ${Math.abs(cashDiff) < 0.01 ? "bg-emerald-50 text-emerald-700" : cashDiff > 0 ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                <div className="flex justify-between font-medium">
                  <span>{cashDiff > 0.01 ? "Fazla" : cashDiff < -0.01 ? "Eksik" : "Eşleşiyor"}</span>
                  <span>{cashDiff >= 0 ? "+" : ""}{formatCurrency(cashDiff)}</span>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-bold text-base">
                <span>Net Ciro</span>
                <span className="text-emerald-600">{formatCurrency(netRevenue)}</span>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Kasayı Kapat
            </Button>

            <Button variant="outline" className="w-full" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Raporu Yazdır
            </Button>
          </CardContent>
        </Card>

        {/* Giderler */}
        {expenses.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Günün Giderleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                  <div>
                    <p className="font-medium">{e.description}</p>
                    <p className="text-xs text-muted-foreground">{e.category}</p>
                  </div>
                  <span className="text-red-600 font-semibold">{formatCurrency(e.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
