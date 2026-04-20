"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, cn } from "@/lib/utils";
import { PromotionType } from "@prisma/client";
import { Tag, Gift, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

const typeLabels: Record<PromotionType, string> = {
  PERCENTAGE: "Yüzde İndirim", FIXED_AMOUNT: "Sabit İndirim",
  BUY_X_GET_Y: "X Al Y Öde", FREE_ITEM: "Ücretsiz Ürün", GIFT_CARD: "Hediye Kartı",
};

interface Promotion {
  id: string; name: string; type: PromotionType; value: number; code?: string | null;
  isActive: boolean; usedCount: number; maxUses?: number | null; startsAt: Date; endsAt?: Date | null;
}
interface GiftCard { id: string; code: string; balance: number; initialBalance: number; isActive: boolean; expiresAt?: Date | null }

interface PromotionsClientProps { promotions: Promotion[]; giftCards: GiftCard[]; organizationId: string }

export function PromotionsClient({ promotions: initialPromos, giftCards: initialCards, organizationId }: PromotionsClientProps) {
  const [promotions, setPromotions] = useState(initialPromos);
  const [giftCards, setGiftCards] = useState(initialCards);
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoForm, setPromoForm] = useState({ name: "", type: "PERCENTAGE" as PromotionType, value: "", code: "", startsAt: new Date().toISOString().slice(0, 10), endsAt: "" });
  const [cardForm, setCardForm] = useState({ balance: "" });

  async function addPromotion(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...promoForm, organizationId, value: parseFloat(promoForm.value) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPromotions((prev) => [data, ...prev]);
      setShowAddPromo(false);
      toast.success("Kampanya oluşturuldu");
    } catch { toast.error("İşlem başarısız"); }
    finally { setLoading(false); }
  }

  async function addGiftCard(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: parseFloat(cardForm.balance) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGiftCards((prev) => [data, ...prev]);
      setShowAddCard(false);
      toast.success("Hediye kartı oluşturuldu");
    } catch { toast.error("İşlem başarısız"); }
    finally { setLoading(false); }
  }

  async function togglePromo(id: string, isActive: boolean) {
    await fetch(`/api/promotions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setPromotions((prev) => prev.map((p) => p.id === id ? { ...p, isActive } : p));
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Aktif Kampanya</p>
          <p className="text-2xl font-bold text-primary">{promotions.filter((p) => p.isActive).length}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Toplam Kullanım</p>
          <p className="text-2xl font-bold">{promotions.reduce((s, p) => s + p.usedCount, 0)}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Aktif Hediye Kartı</p>
          <p className="text-2xl font-bold">{giftCards.filter((c) => c.isActive).length}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="promotions">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="promotions"><Tag className="w-3.5 h-3.5 mr-1.5" />Kampanyalar</TabsTrigger>
            <TabsTrigger value="giftcards"><Gift className="w-3.5 h-3.5 mr-1.5" />Hediye Kartları</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowAddCard(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />Hediye Kartı
            </Button>
            <Button size="sm" onClick={() => setShowAddPromo(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />Kampanya Ekle
            </Button>
          </div>
        </div>

        <TabsContent value="promotions" className="mt-4 space-y-4">
          {showAddPromo && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <form onSubmit={addPromotion} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Kampanya Adı</Label>
                      <Input value={promoForm.name} onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tür</Label>
                      <Select value={promoForm.type} onValueChange={(v) => v !== null && setPromoForm({ ...promoForm, type: v as PromotionType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(typeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Değer ({promoForm.type === "PERCENTAGE" ? "%" : "₺"})</Label>
                      <Input type="number" step="0.01" value={promoForm.value}
                        onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Kupon Kodu (opsiyonel)</Label>
                      <Input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                        placeholder="INDIRIM20" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Başlangıç</Label>
                      <Input type="date" value={promoForm.startsAt}
                        onChange={(e) => setPromoForm({ ...promoForm, startsAt: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Bitiş</Label>
                      <Input type="date" value={promoForm.endsAt}
                        onChange={(e) => setPromoForm({ ...promoForm, endsAt: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddPromo(false)}>İptal</Button>
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}Kaydet
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {promotions.map((p) => (
              <Card key={p.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{p.name}</p>
                        <Badge variant="secondary" className="text-xs">{typeLabels[p.type]}</Badge>
                      </div>
                      <p className="text-sm text-primary font-medium">
                        {p.type === "PERCENTAGE" ? `%${p.value} indirim` : formatCurrency(p.value)}
                      </p>
                      {p.code && <p className="text-xs text-muted-foreground mt-0.5">Kod: <code className="bg-muted px-1 rounded">{p.code}</code></p>}
                      <p className="text-xs text-muted-foreground">{p.usedCount} kullanım</p>
                    </div>
                  </div>
                  <Switch checked={p.isActive} onCheckedChange={(v) => togglePromo(p.id, v)} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="giftcards" className="mt-4 space-y-4">
          {showAddCard && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <form onSubmit={addGiftCard} className="flex items-end gap-3">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Başlangıç Bakiyesi (₺)</Label>
                    <Input type="number" step="0.01" value={cardForm.balance}
                      onChange={(e) => setCardForm({ ...cardForm, balance: e.target.value })} required />
                  </div>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}Oluştur
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setShowAddCard(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Kod", "Bakiye", "Başlangıç", "Durum"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {giftCards.map((card) => (
                  <tr key={card.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-sm">{card.code}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(card.balance)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(card.initialBalance)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium", card.isActive ? "text-emerald-600" : "text-gray-400")}>
                        {card.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
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
