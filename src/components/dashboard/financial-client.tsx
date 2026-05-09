"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, calcPercentChange, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface Expense { id: string; category: string; description: string; amount: number; date: Date }

interface FinancialClientProps {
  thisMonth: { _sum: { totalAmount: number | null; taxAmount: number | null; discountAmount: number | null }; _count: number };
  lastMonth: { _sum: { totalAmount: number | null }; _count: number };
  expenses: Expense[];
  totalExpenses: number;
  locationId: string;
}

const EXPENSE_CATEGORIES = ["Kira", "Personel", "Hammadde", "Enerji", "Pazarlama", "Bakım", "Diğer"];

export function FinancialClient({ thisMonth, lastMonth, expenses: initialExpenses, totalExpenses: initialTotal, locationId }: FinancialClientProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [totalExpenses, setTotalExpenses] = useState(initialTotal);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expForm, setExpForm] = useState({ category: "Diğer", description: "", amount: "", date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);

  const revenue = thisMonth._sum.totalAmount ?? 0;
  const lastRevenue = lastMonth._sum.totalAmount ?? 0;
  const tax = thisMonth._sum.taxAmount ?? 0;
  const discount = thisMonth._sum.discountAmount ?? 0;
  const profit = revenue - totalExpenses;
  const revenueChange = calcPercentChange(revenue, lastRevenue);

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...expForm, locationId, amount: parseFloat(expForm.amount) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExpenses((prev) => [data, ...prev]);
      setTotalExpenses((prev) => prev + data.amount);
      setShowAddExpense(false);
      toast.success("Gider eklendi");
    } catch { toast.error("İşlem başarısız"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Aylık Ciro", value: formatCurrency(revenue), change: revenueChange, positive: revenueChange >= 0 },
          { label: "Aylık Gider", value: formatCurrency(totalExpenses), change: null },
          { label: "Net Kâr", value: formatCurrency(profit), highlight: profit >= 0 ? "text-emerald-600" : "text-red-600" },
          { label: "KDV (18%)", value: formatCurrency(tax), change: null },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-0.5", s.highlight || "")}>{s.value}</p>
              {s.change !== null && s.change !== undefined && (
                <div className={cn("flex items-center gap-1 text-xs mt-1", s.positive ? "text-emerald-600" : "text-red-500")}>
                  {s.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  %{Math.abs(s.change).toFixed(1)} geçen aya göre
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Özet</TabsTrigger>
          <TabsTrigger value="expenses">Giderler</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Bu Ay Özet</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Brüt Ciro", value: revenue, color: "text-emerald-600" },
                  { label: "İndirimler", value: -discount, color: "text-red-500" },
                  { label: "KDV", value: -tax, color: "text-amber-600" },
                  { label: "Net Ciro", value: revenue - discount - tax, color: "text-primary font-bold" },
                  { label: "Toplam Gider", value: -totalExpenses, color: "text-red-600" },
                  { label: "Net Kâr", value: profit, color: profit >= 0 ? "text-emerald-600 font-bold text-lg" : "text-red-600 font-bold text-lg" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={cn("text-sm font-semibold", row.color)}>{formatCurrency(Math.abs(row.value))}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddExpense(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Gider Ekle
            </Button>
          </div>

          {showAddExpense && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <form onSubmit={addExpense} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Kategori</Label>
                    <select className="w-full border rounded-lg px-2 py-2 text-sm"
                      value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                      {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <Label className="text-xs">Açıklama</Label>
                    <Input value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tutar (₺)</Label>
                    <Input type="number" step="0.01" value={expForm.amount}
                      onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tarih</Label>
                    <Input type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Kaydet"}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddExpense(false)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary/8 border-b border-primary/15">
                <tr>
                  {["Tarih", "Kategori", "Açıklama", "Tutar"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-primary/80 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Gider kaydı yok</td></tr>
                ) : expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3"><span className="bg-muted text-xs px-2 py-0.5 rounded-full">{exp.category}</span></td>
                    <td className="px-4 py-3">{exp.description}</td>
                    <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
