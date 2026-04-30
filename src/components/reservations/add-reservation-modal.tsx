"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidTurkishPhone, PHONE_ERROR } from "@/lib/phone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReservationStatus } from "@prisma/client";
import { TableStatus } from "@prisma/client";

interface Table { id: string; name: string; capacity: number; status: TableStatus }

interface AddReservationModalProps {
  locationId: string;
  tables: Table[];
  onClose: () => void;
  onSaved: (r: { id: string; guestName: string; guestPhone?: string | null; guestCount: number; date: Date; duration: number; status: ReservationStatus; notes?: string | null; table?: { id: string; name: string; capacity: number } | null; customer?: { name: string; phone?: string | null } | null }) => void;
}

export function AddReservationModal({ locationId, tables, onClose, onSaved }: AddReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const today = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({
    guestName: "", guestPhone: "", guestEmail: "", guestCount: "2",
    date: today, duration: "90", tableId: "", notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.guestPhone && !isValidTurkishPhone(form.guestPhone)) {
      setPhoneError(PHONE_ERROR);
      return;
    }
    setPhoneError("");
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId, guestName: form.guestName, guestPhone: form.guestPhone || null,
          guestEmail: form.guestEmail || null, guestCount: parseInt(form.guestCount),
          date: new Date(form.date).toISOString(), duration: parseInt(form.duration),
          tableId: form.tableId || null, notes: form.notes || null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success("Rezervasyon alındı");
      onSaved(data);
    } catch { toast.error("İşlem başarısız"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Rezervasyon Al</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-2">
            <Label>Misafir Adı *</Label>
            <Input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={form.guestPhone}
                onChange={(e) => { setForm({ ...form, guestPhone: e.target.value }); setPhoneError(""); }}
                onBlur={() => { if (form.guestPhone && !isValidTurkishPhone(form.guestPhone)) setPhoneError(PHONE_ERROR); }}
                placeholder="05XX XXX XX XX"
              />
              {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
            </div>
            <div className="space-y-2">
              <Label>Kişi Sayısı</Label>
              <Input type="number" min="1" value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tarih & Saat *</Label>
              <Input type="datetime-local" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Süre (dk)</Label>
              <Select value={form.duration} onValueChange={(v) => v !== null && setForm({ ...form, duration: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["60", "90", "120", "150", "180"].map((d) => (
                    <SelectItem key={d} value={d}>{d} dk</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {tables.length > 0 && (
            <div className="space-y-2">
              <Label>Masa (Opsiyonel)</Label>
              <Select value={form.tableId} onValueChange={(v) => v !== null && setForm({ ...form, tableId: v })}>
                <SelectTrigger><SelectValue placeholder="Masa seçin" /></SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.capacity} kişi)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Not</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
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
