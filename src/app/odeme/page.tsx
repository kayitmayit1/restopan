"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RestoPanLogo } from "@/components/ui/restopan-logo";

function OdemeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan") ?? "PROFESSIONAL";
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const planLabel = plan === "ENTERPRISE" ? "Enterprise" : "Professional";
  const planPrice = plan === "ENTERPRISE" ? "2.499" : "999";

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ plan, acceptedTerms: true, fromPaymentPage: true }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/dashboard/ayarlar/fatura?success=1"), 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-bold">Ödeme Başarılı!</h2>
          <p className="text-muted-foreground">Planınız aktive edildi, yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b h-14 flex items-center justify-center gap-3">
        <RestoPanLogo iconSize={28} />
        <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
          {planLabel} — ₺{planPrice}/ay
        </span>
      </header>

      <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-emerald-500" />
            Güvenli ödeme sayfası
          </div>

          <div className="border rounded-xl p-4 bg-gray-50 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{planLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dönem</span>
              <span className="font-medium">Aylık</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="font-semibold">Toplam</span>
              <span className="font-bold text-primary">₺{planPrice}</span>
            </div>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Kart Numarası</Label>
              <div className="relative">
                <Input placeholder="5528 7900 0000 0001" maxLength={19} className="pr-10" />
                <CreditCard className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Kart Üzerindeki İsim</Label>
              <Input placeholder="AD SOYAD" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Son Kullanma</Label>
                <Input placeholder="AA/YY" maxLength={5} />
              </div>
              <div className="space-y-1.5">
                <Label>CVV</Label>
                <Input placeholder="123" maxLength={3} type="password" />
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Test modu — gerçek kart bilgisi girilmez
            </p>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              ₺{planPrice} Öde
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function OdemePage() {
  return (
    <Suspense>
      <OdemeContent />
    </Suspense>
  );
}
