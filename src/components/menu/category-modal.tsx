"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface CategoryModalProps {
  organizationId: string;
  category: Category | null;
  onClose: () => void;
  onSaved: (cat: Category) => void;
}

export function CategoryModal({
  organizationId,
  category,
  onClose,
  onSaved,
}: CategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: category?.name || "",
    isActive: category?.isActive ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = category
        ? `/api/menu/categories/${category.id}`
        : "/api/menu/categories";
      const method = category ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizationId }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(category ? "Kategori güncellendi" : "Kategori eklendi");
      onSaved(data);
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
          <h2 className="font-semibold">
            {category ? "Kategoriyi Düzenle" : "Kategori Ekle"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Kategori Adı</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Ana Yemekler"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Aktif</Label>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
