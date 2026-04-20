"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  cost?: number | null;
  isActive: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
  variants: MenuItemVariant[];
}

interface ItemModalProps {
  organizationId: string;
  categoryId: string;
  categories: Category[];
  item: MenuItem | null;
  onClose: () => void;
  onSaved: (item: MenuItem, categoryId: string) => void;
}

export function ItemModal({
  organizationId,
  categoryId,
  categories,
  item,
  onClose,
  onSaved,
}: ItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(categoryId);
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    cost: item?.cost?.toString() || "",
    isActive: item?.isActive ?? true,
    isAvailable: item?.isAvailable ?? true,
    isFeatured: item?.isFeatured ?? false,
    taxRate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.price) {
      toast.error("Fiyat zorunludur");
      return;
    }
    setLoading(true);
    try {
      const url = item ? `/api/menu/items/${item.id}` : "/api/menu/items";
      const method = item ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          organizationId,
          categoryId: selectedCatId,
          price: parseFloat(form.price),
          cost: form.cost ? parseFloat(form.cost) : null,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(item ? "Ürün güncellendi" : "Ürün eklendi");
      onSaved(data, selectedCatId);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{item ? "Ürünü Düzenle" : "Ürün Ekle"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={selectedCatId} onValueChange={(v) => v !== null && setSelectedCatId(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ürün Adı *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Izgara Köfte"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Açıklama</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ürün açıklaması..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Satış Fiyatı (₺) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Maliyet (₺)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {form.price && form.cost && (
            <div className="bg-emerald-50 rounded-lg p-3 text-sm">
              <span className="text-emerald-700 font-medium">
                Kar Marjı: %
                {(
                  ((parseFloat(form.price) - parseFloat(form.cost)) /
                    parseFloat(form.price)) *
                  100
                ).toFixed(1)}
              </span>
            </div>
          )}

          <div className="space-y-3">
            {[
              { key: "isActive", label: "Aktif" },
              { key: "isAvailable", label: "Stokta Mevcut" },
              { key: "isFeatured", label: "Öne Çıkan" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch
                  checked={form[key as keyof typeof form] as boolean}
                  onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                />
              </div>
            ))}
          </div>
        </form>
        <div className="p-5 border-t flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
