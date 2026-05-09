"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MemberRole, ShiftStatus } from "@prisma/client";

interface Member {
  id: string; role: MemberRole;
  user: { id: string; name?: string | null; email: string };
}

interface AddShiftModalProps {
  locationId: string;
  members: Member[];
  onClose: () => void;
  onSaved: (shift: { id: string; staffId: string; date: Date; startTime: string; endTime: string; status: ShiftStatus }) => void;
}

export function AddShiftModal({ locationId, members, onClose, onSaved }: AddShiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    staffId: members[0]?.user.id || "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "18:00",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locationId }),
      });
      if (!res.ok) throw new Error();
      const shift = await res.json();
      toast.success("Vardiya eklendi");
      onSaved(shift);
    } catch {
      toast.error("Vardiya eklenemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Vardiya Ekle</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Personel</Label>
            <Select value={form.staffId} onValueChange={(v) => v !== null && setForm({ ...form, staffId: v })}>
              <SelectTrigger>
                <SelectValue>
                  {members.find((m) => m.user.id === form.staffId)?.user.name ||
                   members.find((m) => m.user.id === form.staffId)?.user.email ||
                   "Personel seçin"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.user.id} value={m.user.id}>
                    {m.user.name || m.user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tarih</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Başlangıç</Label>
              <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bitiş</Label>
              <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">İptal</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Ekle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
