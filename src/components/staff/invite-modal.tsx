"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  { value: "MANAGER", label: "Müdür" },
  { value: "CASHIER", label: "Kasiyer" },
  { value: "WAITER", label: "Garson" },
  { value: "KITCHEN", label: "Mutfak" },
  { value: "STAFF", label: "Personel" },
];

export function InviteModal({ organizationId, onClose }: { organizationId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("WAITER");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, email, role }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success("Davet e-postası gönderildi");
    } catch {
      toast.error("Davet gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Personel Davet Et</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        {sent ? (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Mail className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-semibold">Davet Gönderildi!</p>
            <p className="text-sm text-muted-foreground">{email} adresine davet bağlantısı gönderildi.</p>
            <Button onClick={onClose}>Kapat</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>E-posta Adresi</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="personel@ornek.com" required />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={role} onValueChange={(v) => v !== null && setRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">İptal</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Davet Gönder
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
