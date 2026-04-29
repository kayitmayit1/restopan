"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Mail, Copy, Check, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
  const [result, setResult] = useState<{ emailSent: boolean; inviteUrl: string } | null>(null);
  const [limitExceeded, setLimitExceeded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, email, role }),
      });
      const json = await res.json();
      if (res.status === 403 && json.error === "PLAN_LIMIT_EXCEEDED") {
        setLimitExceeded(json.message);
        return;
      }
      if (!res.ok) throw new Error();
      setResult({ emailSent: json.emailSent, inviteUrl: json.inviteUrl });
      if (json.emailSent) {
        toast.success("Davet e-postası gönderildi");
      } else {
        toast.warning("Davet oluşturuldu — e-posta gönderilemedi, linki paylaşın");
      }
    } catch {
      toast.error("Davet gönderilemedi");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!result?.inviteUrl) return;
    navigator.clipboard.writeText(result.inviteUrl);
    setCopied(true);
    toast.success("Link kopyalandı");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Personel Davet Et</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        {limitExceeded ? (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">Kullanıcı Limiti Doldu</p>
              <p className="text-sm text-muted-foreground mt-1">{limitExceeded}</p>
            </div>
            <Link
              href="/dashboard/ayarlar/fatura"
              className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-center"
              onClick={onClose}
            >
              Planı Yükselt →
            </Link>
            <Button variant="outline" onClick={onClose} className="w-full">Kapat</Button>
          </div>
        ) : result ? (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${result.emailSent ? "bg-emerald-100" : "bg-amber-100"}`}>
              {result.emailSent
                ? <Mail className="w-7 h-7 text-emerald-600" />
                : <AlertTriangle className="w-7 h-7 text-amber-600" />
              }
            </div>
            <div>
              <p className="font-semibold">
                {result.emailSent ? "Davet Gönderildi!" : "Davet Oluşturuldu"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.emailSent
                  ? `${email} adresine davet bağlantısı gönderildi.`
                  : "E-posta gönderilemedi. Aşağıdaki linki personelle paylaşın."
                }
              </p>
            </div>

            {/* Always show copyable link */}
            <div className="w-full rounded-xl border bg-muted/50 p-3 text-left">
              <p className="text-[11px] text-muted-foreground mb-1 font-medium">Davet Linki</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-foreground truncate flex-1 font-mono">{result.inviteUrl}</p>
                <button
                  onClick={copyLink}
                  className="flex-shrink-0 w-7 h-7 rounded-lg bg-background border hover:bg-muted flex items-center justify-center transition-colors"
                  title="Kopyala"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <Button onClick={onClose} className="w-full">Kapat</Button>
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
                <SelectTrigger>
                  <SelectValue>{ROLES.find((r) => r.value === role)?.label}</SelectValue>
                </SelectTrigger>
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
