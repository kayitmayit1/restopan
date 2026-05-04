"use client";

import { useState, useRef, useCallback } from "react";
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
import { X, Loader2, ImagePlus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  image?: string | null;
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(categoryId);
  const [imageUrl, setImageUrl] = useState<string | null>(item?.image ?? null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function compressImage(file: File, maxBytes = 4.5 * 1024 * 1024): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const MAX_DIM = 1920;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const attempt = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error("Sıkıştırma başarısız")); return; }
              if (blob.size <= maxBytes || quality <= 0.2) {
                resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
              } else {
                quality = Math.max(0.2, quality - 0.15);
                attempt();
              }
            },
            "image/jpeg",
            quality
          );
        };
        attempt();
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Görsel okunamadı")); };
      img.src = objectUrl;
    });
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece görsel dosyaları yüklenebilir");
      return;
    }
    setUploadingImage(true);
    try {
      const toUpload = file.size > 4.5 * 1024 * 1024 ? await compressImage(file) : file;
      const fd = new FormData();
      fd.append("file", toUpload);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Yükleme başarısız");
      setImageUrl(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Görsel yüklenemedi");
    } finally {
      setUploadingImage(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadImage(file);
  }, []);

  async function handleSubmit(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Ürün adı zorunludur");
      return;
    }
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
          organizationId,
          categoryId: selectedCatId,
          name: form.name.trim(),
          description: form.description || undefined,
          price: parseFloat(form.price),
          cost: form.cost ? parseFloat(form.cost) : null,
          taxRate: form.taxRate ? parseFloat(form.taxRate) : null,
          isActive: form.isActive,
          isAvailable: form.isAvailable,
          isFeatured: form.isFeatured,
          image: imageUrl ?? null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? "Sunucu hatası");
      }
      const data = await res.json();
      toast.success(item ? "Ürün güncellendi" : "Ürün eklendi");
      onSaved(data, selectedCatId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  const margin =
    form.price && form.cost
      ? (((parseFloat(form.price) - parseFloat(form.cost)) / parseFloat(form.price)) * 100).toFixed(1)
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">{item ? "Ürünü Düzenle" : "Ürün Ekle"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {/* Image upload */}
          <div className="px-5 pt-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {imageUrl ? (
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-muted group">
                <Image
                  src={imageUrl}
                  alt="Ürün görseli"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Değiştir
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setImageUrl(null)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                disabled={uploadingImage}
                className={cn(
                  "w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-6 h-6 text-muted-foreground/60" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        Görsel ekle
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        Tıkla veya sürükle • JPG, PNG, WebP • max 5MB
                      </p>
                    </div>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={selectedCatId} onValueChange={(v) => v !== null && setSelectedCatId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {categories.find((c) => c.id === selectedCatId)?.name ?? "Kategori seçin"}
                  </SelectValue>
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

            {margin && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-sm">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Kar Marjı: %{margin}
                </span>
              </div>
            )}

            <div className="space-y-3 pt-1">
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
          </div>
        </form>

        <div className="px-5 py-4 border-t flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={loading || uploadingImage}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}
