"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Zap, Building2, Rocket, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: "Ücretsiz",
    icon: Zap,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    features: [
      "10 masa, 2 kullanıcı, 1 şube",
      "Temel POS & siparişler",
      "Görsellli dijital QR menü",
      "Günün menüsü duyuru bandı",
      "Wi-Fi şifresi & sosyal medya menüde",
    ],
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    price: "₺999/ay",
    icon: Rocket,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/30",
    badge: "En Popüler",
    features: [
      "50 masa, 10 kullanıcı, 3 şube",
      "Starter'daki tüm özellikler",
      "Garson çağır & hesap iste",
      "Online & paket sipariş sayfası",
      "Stok & envanter yönetimi",
      "Gelişmiş raporlar & analitik",
      "Kampanyalar & müşteri yönetimi",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Size özel",
    icon: Building2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    features: [
      "Sınırsız masa, kullanıcı & şube",
      "Professional'daki tüm özellikler",
      "Özel entegrasyon & API erişimi",
      "Öncelikli destek & yerinde kurulum",
    ],
  },
];

interface Props {
  plan: string;
  status: string;
  trialDaysLeft: number | null;
  periodEnd: string | null;
  hasIyzicoSubscription: boolean;
  termsAcceptedAt: string | null;
}

export function BillingClient({
  plan,
  status,
  trialDaysLeft,
  periodEnd,
  hasIyzicoSubscription,
  termsAcceptedAt,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingTermsChecked, setBillingTermsChecked] = useState(!!termsAcceptedAt);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "1") {
      toast.success("Ödeme başarılı! Planınız güncellendi.");
      router.replace("/dashboard/ayarlar/fatura");
    } else if (error === "payment_failed") {
      toast.error("Ödeme başarısız. Lütfen tekrar deneyin.");
      router.replace("/dashboard/ayarlar/fatura");
    } else if (error === "checkout_config") {
      toast.error("Ödeme planı yapılandırması eksik. Destek ile iletişime geçin.");
      router.replace("/dashboard/ayarlar/fatura");
    } else if (error === "1") {
      toast.error("Bir hata oluştu. Lütfen destek ile iletişime geçin.");
      router.replace("/dashboard/ayarlar/fatura");
    } else if (error === "terms_required") {
      toast.error("Ücretli işlemden önce sözleşme metinlerini onaylamanız gerekir.");
      router.replace("/dashboard/ayarlar/fatura");
    }
  }, [searchParams, router]);

  useEffect(() => {
    setBillingTermsChecked(!!termsAcceptedAt);
  }, [termsAcceptedAt]);

  async function handleUpgrade(targetPlan: "PROFESSIONAL" | "ENTERPRISE") {
    if (targetPlan === "ENTERPRISE") {
      window.location.href = "mailto:satis@restopan.com?subject=Enterprise Plan Talebi";
      return;
    }
    if (!termsAcceptedAt && !billingTermsChecked) {
      toast.error("Devam etmek için aşağıdaki sözleşme onay kutusunu işaretleyin.");
      return;
    }
    setLoading(targetPlan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: targetPlan,
          ...(!termsAcceptedAt && billingTermsChecked ? { acceptedTerms: true as const } : {}),
        }),
      });
      let data: { url?: string; success?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* empty */
      }
      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Ödeme sayfasına geçiş başarısız."
        );
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
      } else if (data.success) {
        toast.success("Plan güncellendi");
        window.location.reload();
      } else {
        toast.error("Ödeme sayfası adresi alınamadı. Lütfen tekrar deneyin.");
      }
    } catch {
      toast.error("İşlem başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(null);
    }
  }

  async function handleStartTrial() {
    if (!termsAcceptedAt && !billingTermsChecked) {
      toast.error("Denemeye başlamadan önce sözleşme onay kutusunu işaretleyin.");
      return;
    }
    setLoading("trial");
    try {
      const res = await fetch("/api/billing/trial", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          !termsAcceptedAt && billingTermsChecked ? { acceptedTerms: true as const } : {}
        ),
      });
      if (res.ok) {
        toast.success("14 günlük deneme başladı!");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          typeof data.error === "string" ? data.error : "İşlem başarısız.";
        toast.error(msg);
      }
    } catch {
      toast.error("İşlem başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(null);
    }
  }

  function handleBuyNow() {
    handleUpgrade("PROFESSIONAL");
  }

  async function handleCancel() {
    if (!cancelConfirm) {
      setCancelConfirm(true);
      return;
    }
    setLoading("cancel");
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST", credentials: "same-origin" });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: unknown };
      if (data.success) {
        toast.success("Abonelik iptal edildi. Starter plana geçildi.");
        window.location.reload();
      } else {
        const msg =
          typeof data.error === "string" ? data.error : "İptal işlemi başarısız.";
        toast.error(msg);
      }
    } catch {
      toast.error("İptal işlemi başarısız.");
    } finally {
      setLoading(null);
      setCancelConfirm(false);
    }
  }

  const statusLabel: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    TRIALING: { label: "Deneme", variant: "secondary" },
    ACTIVE: { label: "Aktif", variant: "default" },
    PAST_DUE: { label: "Ödeme Bekliyor", variant: "destructive" },
    CANCELED: { label: "İptal Edildi", variant: "destructive" },
  };

  const currentStatus = statusLabel[status] ?? { label: status, variant: "secondary" as const };
  const canCancel = hasIyzicoSubscription && (status === "ACTIVE" || status === "PAST_DUE");

  return (
    <div className="max-w-4xl space-y-6">
      {!termsAcceptedAt && (
        <label className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={billingTermsChecked}
            onChange={(e) => setBillingTermsChecked(e.target.checked)}
            className="mt-1 rounded border-gray-300"
          />
          <span>
            Ücretli plan ve ödeme süreçlerine devam etmek için{" "}
            <Link href="/kullanim-kosullari" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Kullanım Koşulları
            </Link>{" "}
            ile{" "}
            <Link
              href="/mesafeli-satis-sozlesmesi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Mesafeli Satış ön bilgilendirme ile sözleşme metinleri
            </Link>
            ’ni okudum ve kabul ediyorum.
          </span>
        </label>
      )}

      {/* Current plan summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mevcut Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-2xl font-bold">{plan}</div>
              <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
              {trialDaysLeft !== null && trialDaysLeft <= 7 && (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {trialDaysLeft} gün kaldı
                </div>
              )}
            </div>
            {canCancel && (
              <div className="flex items-center gap-2">
                {cancelConfirm ? (
                  <>
                    <span className="text-xs text-destructive">Emin misiniz?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCancel}
                      disabled={loading === "cancel"}
                    >
                      {loading === "cancel" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      Evet, İptal Et
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCancelConfirm(false)}>
                      Vazgeç
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleCancel}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Aboneliği İptal Et
                  </Button>
                )}
              </div>
            )}
            {hasIyzicoSubscription && status === "PAST_DUE" && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                Ödeme sorunu için destek ile iletişime geçin
              </div>
            )}
          </div>
          {periodEnd && (
            <p className="text-xs text-muted-foreground mt-2">
              {status === "TRIALING" ? "Deneme süresi" : "Dönem"} bitiş:{" "}
              {new Date(periodEnd).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan cards */}
      <div className="grid grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const isCurrent = plan === p.id && status !== "TRIALING";
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-2xl border-2 p-6 relative transition-all",
                isCurrent ? "border-primary shadow-md" : p.border,
                p.bg
              )}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {p.badge}
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Mevcut
                  </span>
                </div>
              )}

              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", p.bg, "border", p.border)}>
                <Icon className={cn("w-5 h-5", p.color)} />
              </div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className={cn("text-2xl font-bold mt-1 mb-4", p.color)}>{p.price}</p>

              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Mevcut Plan
                </Button>
              ) : p.id === "STARTER" ? (
                <Button variant="outline" className="w-full" disabled>
                  Ücretsiz
                </Button>
              ) : p.id === "ENTERPRISE" ? (
                <Button
                  variant="outline"
                  className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                  onClick={() => handleUpgrade("ENTERPRISE")}
                >
                  Teklif Alın
                </Button>
              ) : plan === "STARTER" && p.id === "PROFESSIONAL" ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleStartTrial}
                    disabled={!!loading}
                  >
                    {loading === "trial" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Denemeyi Başlat
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleBuyNow}
                    disabled={!!loading}
                  >
                    {loading === "PROFESSIONAL" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Hemen Satın Al
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(p.id as "PROFESSIONAL")}
                  disabled={!!loading}
                >
                  {loading === p.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {status === "TRIALING" ? "Satın Al" : plan === "STARTER" ? "Yükselt" : "Geçiş Yap"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
