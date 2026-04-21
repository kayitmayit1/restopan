"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Yönetici", MANAGER: "Müdür", CASHIER: "Kasiyer",
  WAITER: "Garson", KITCHEN: "Mutfak", STAFF: "Personel",
};

interface InviteInfo {
  email: string;
  role: string;
  organizationName: string;
}

function DavetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "done">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Geçersiz davet bağlantısı."); return; }

    fetch(`/api/davet?token=${token}`)
      .then(async (res) => {
        if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
        return res.json();
      })
      .then((data) => { setInvite(data); setStatus("ready"); })
      .catch((e) => { setStatus("error"); setErrorMsg(e.message ?? "Davet bulunamadı."); });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Ad soyad giriniz"); return; }
    setSubmitting(true);

    try {
      const res = await fetch("/api/davet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }

      await signIn("credentials", { email: invite!.email, password, redirect: false });
      setStatus("done");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "İşlem başarısız");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8">
      {status === "loading" && (
        <div className="flex flex-col items-center py-8 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Davet kontrol ediliyor…</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center py-8 gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="font-semibold">Davet Geçersiz</p>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/giris")} className="mt-2">
            Giriş Sayfasına Dön
          </Button>
        </div>
      )}

      {status === "done" && (
        <div className="flex flex-col items-center py-8 gap-3 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          <p className="font-semibold">Hoş Geldiniz!</p>
          <p className="text-sm text-muted-foreground">Dashboard'a yönlendiriliyorsunuz…</p>
        </div>
      )}

      {status === "ready" && invite && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
            <p className="font-semibold">{invite.organizationName}</p>
            <p className="text-muted-foreground">
              {ROLE_LABELS[invite.role] ?? invite.role} olarak davet edildiniz
            </p>
            <p className="text-xs text-muted-foreground">{invite.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Ad Soyad</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız Soyadınız"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Şifre Belirleyin</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Daveti Kabul Et ve Giriş Yap
          </Button>
        </form>
      )}
    </div>
  );
}

export default function DavetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-xl">RestoPan</span>
        </div>
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-sm border p-8 flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <DavetContent />
        </Suspense>
      </div>
    </div>
  );
}
