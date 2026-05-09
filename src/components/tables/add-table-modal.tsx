"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TableStatus, TableShape } from "@prisma/client";
import { usePlanLimit } from "@/hooks/use-plan-limit";

interface EditTableData {
  id: string;
  name: string;
  capacity: number;
  section?: string | null;
  shape: TableShape;
  status: TableStatus;
}

interface AddTableModalProps {
  locationId: string;
  onClose: () => void;
  onAdded: (table: { id: string; name: string; capacity: number; section?: string | null; posX: number; posY: number; width: number; height: number; shape: TableShape; status: TableStatus }) => void;
  editTable?: EditTableData;
  onEdited?: (table: EditTableData) => void;
}

export function AddTableModal({ locationId, onClose, onAdded, editTable, onEdited }: AddTableModalProps) {
  const [loading, setLoading] = useState(false);
  const { handleResponse } = usePlanLimit();
  const isEdit = !!editTable;
  const [form, setForm] = useState({
    name: editTable?.name ?? "",
    capacity: String(editTable?.capacity ?? 4),
    section: editTable?.section ?? "",
    shape: editTable?.shape ?? "RECTANGLE",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/tables/${editTable.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            capacity: parseInt(form.capacity),
            section: form.section || null,
          }),
        });
      } else {
        res = await fetch("/api/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationId,
            name: form.name,
            capacity: parseInt(form.capacity),
            section: form.section || null,
            shape: form.shape,
          }),
        });
        if (!handleResponse(res)) return;
      }
      if (res.status === 409) {
        toast.error("Bu masa adı zaten kullanımda");
        return;
      }
      if (!res.ok) throw new Error();
      const table = await res.json();
      if (isEdit) {
        toast.success("Masa güncellendi");
        onEdited?.(table);
      } else {
        toast.success("Masa eklendi");
        onAdded(table);
      }
    } catch {
      toast.error(isEdit ? "Masa güncellenemedi" : "Masa eklenemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">{isEdit ? "Masa Düzenle" : "Masa Ekle"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Masa Adı</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Örn: Masa 1, Bahçe 3"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Kapasite</Label>
              <Input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bölüm</Label>
              <Input
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="İç Mekan"
              />
            </div>
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label>Şekil</Label>
              <div className="flex gap-2">
                {(["RECTANGLE", "CIRCLE", "SQUARE"] as TableShape[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, shape: s })}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      form.shape === s
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border"
                    }`}
                  >
                    {s === "RECTANGLE" ? "Dikdörtgen" : s === "CIRCLE" ? "Yuvarlak" : "Kare"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
