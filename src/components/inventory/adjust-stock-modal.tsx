"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string; name: string; unit: string; quantity: number;
  minQuantity: number; costPerUnit: number;
  category?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
  sku?: string | null; maxQuantity?: number | null; isActive: boolean;
}

interface AdjustStockModalProps {
  item: InventoryItem;
  locationId: string;
  onClose: () => void;
  onSaved: (item: InventoryItem, movement: { id: string; type: string; quantity: number; createdAt: Date; notes?: string | null; inventoryItem: { name: string; unit: string } }) => void;
}

const MOVE_TYPES = [
  { value: "PURCHASE", label: "Satın Alım (+)" },
  { value: "WASTE", label: "Fire / Kayıp (-)" },
  { value: "ADJUSTMENT", label: "Düzeltme" },
  { value: "RETURN", label: "İade (+)" },
  { value: "TRANSFER", label: "Transfer" },
];

export function AdjustStockModal({ item, locationId, onClose, onSaved }: AdjustStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "PURCHASE",
    quantity: "",
    notes: "",
    costPerUnit: item.costPerUnit.toString(),
  });

  const isPositive = ["PURCHASE", "RETURN"].includes(form.type);
  const qty = parseFloat(form.quantity) || 0;
  const newQty = isPositive ? item.quantity + qty : item.quantity - qty;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (qty <= 0) { toast.error("Miktar 0'dan büyük olmalı"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          inventoryItemId: item.id,
          type: form.type,
          quantity: isPositive ? qty : -qty,
          costPerUnit: parseFloat(form.costPerUnit) || undefined,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      const { movement, item: updatedItem } = await res.json();
      toast.success("Stok güncellendi");
      onSaved(updatedItem, movement);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="font-semibold">Stok Güncelle</h2>
            <p className="text-xs text-muted-foreground">{item.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-muted rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Mevcut Stok</span>
            <span className="font-bold text-lg">{item.quantity} {item.unit}</span>
          </div>

          <div className="space-y-2">
            <Label>İşlem Türü</Label>
            <Select value={form.type} onValueChange={(v) => v !== null && setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MOVE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Miktar ({item.unit})</Label>
              <Input type="number" step="0.01" min="0.01" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            {isPositive && (
              <div className="space-y-2">
                <Label>Birim Maliyet (₺)</Label>
                <Input type="number" step="0.01" value={form.costPerUnit}
                  onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} />
              </div>
            )}
          </div>

          {qty > 0 && (
            <div className={`rounded-lg px-3 py-2 text-sm font-medium ${newQty < item.minQuantity ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              Yeni Stok: {newQty.toFixed(2)} {item.unit}
            </div>
          )}

          <div className="space-y-2">
            <Label>Not</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Opsiyonel..." rows={2} />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
