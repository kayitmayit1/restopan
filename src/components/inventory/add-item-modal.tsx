"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const UNITS = ["kg", "g", "lt", "ml", "adet", "porsiyon", "koli", "paket"];

interface InventoryCategory { id: string; name: string }
interface InventoryItem {
  id: string; name: string; sku?: string | null; unit: string;
  quantity: number; minQuantity: number; maxQuantity?: number | null;
  costPerUnit: number; isActive: boolean;
  category?: InventoryCategory | null; supplier?: { id: string; name: string } | null;
}

interface AddItemModalProps {
  locationId: string;
  organizationId: string;
  categories: InventoryCategory[];
  item: InventoryItem | null;
  onClose: () => void;
  onSaved: (item: InventoryItem) => void;
}

export function AddItemModal({ locationId, organizationId, categories, item, onClose, onSaved }: AddItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || "",
    sku: item?.sku || "",
    unit: item?.unit || "kg",
    quantity: item?.quantity?.toString() || "0",
    minQuantity: item?.minQuantity?.toString() || "0",
    maxQuantity: item?.maxQuantity?.toString() || "",
    costPerUnit: item?.costPerUnit?.toString() || "0",
    categoryId: item?.category?.id || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = item ? `/api/inventory/${item.id}` : "/api/inventory";
      const res = await fetch(url, {
        method: item ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          organizationId,
          name: form.name,
          sku: form.sku || null,
          unit: form.unit,
          quantity: parseFloat(form.quantity) || 0,
          minQuantity: parseFloat(form.minQuantity) || 0,
          maxQuantity: form.maxQuantity ? parseFloat(form.maxQuantity) : null,
          costPerUnit: parseFloat(form.costPerUnit) || 0,
          categoryId: form.categoryId || null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(item ? "Malzeme güncellendi" : "Malzeme eklendi");
      onSaved(data);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{item ? "Malzeme Düzenle" : "Malzeme Ekle"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-2">
            <Label>Malzeme Adı *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>SKU / Kod</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Opsiyonel" />
            </div>
            <div className="space-y-2">
              <Label>Birim</Label>
              <Select value={form.unit} onValueChange={(v) => v !== null && setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Başlangıç Stok</Label>
              <Input type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Minimum Stok</Label>
              <Input type="number" step="0.01" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Maksimum Stok</Label>
              <Input type="number" step="0.01" value={form.maxQuantity} onChange={(e) => setForm({ ...form, maxQuantity: e.target.value })} placeholder="Opsiyonel" />
            </div>
            <div className="space-y-2">
              <Label>Birim Maliyet (₺)</Label>
              <Input type="number" step="0.01" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} />
            </div>
          </div>
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.categoryId} onValueChange={(v) => v !== null && setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Seçin (opsiyonel)" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
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
