"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SavedCustomer {
  id: string; name: string; email?: string | null; phone?: string | null;
  loyaltyPoints: number; totalSpent: number; visitCount: number;
  lastVisitAt?: Date | null; tags: string[]; createdAt: Date;
}

export function AddCustomerModal({ organizationId, onClose, onSaved }: {
  organizationId: string; onClose: () => void; onSaved: (c: SavedCustomer) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", birthdate: "", notes: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizationId, birthdate: form.birthdate || null }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success("Müşteri eklendi");
      onSaved(data);
    } catch { toast.error("İşlem başarısız"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Müşteri Ekle</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Ad Soyad *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="05xx..." />
            </div>
            <div className="space-y-2">
              <Label>Doğum Tarihi</Label>
              <Input type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>E-posta</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Not</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
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
