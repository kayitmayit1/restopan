"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2, Zap, Rocket } from "lucide-react";
import { RestoPanLogo } from "@/components/ui/restopan-logo";
import Link from "next/link";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  organizationName: z.string().min(2, "Restoran adı en az 2 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;
type ProfessionalFlow = "TRIAL" | "BUY_NOW";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    badge: null,
    price: "Ücretsiz",
    sub: "· Süresiz",
    icon: Zap,
    color: "text-slate-600",
    highlight: false,
    features: [
      "10 masa, 2 kullanıcı, 1 şube",
      "Temel POS & siparişler",
      "Görsel dijital QR menü",
      "E-posta destek",
    ],
    cta: "Starter ile Başla",
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    badge: "En Popüler",
    price: "14 Gün Ücretsiz",
    sub: "· Sonra ₺999/ay",
    icon: Rocket,
    color: "text-primary",
    highlight: true,
    features: [
      "50 masa, 10 kullanıcı, 3 şube",
      "Stok, raporlar & kampanyalar",
      "Online & paket sipariş sayfası",
      "WhatsApp destek — 1 saat yanıt",
    ],
    trialCta: "14 Gün Ücretsiz Dene",
    buyCta: "Satın Al",
  },
];

export default function KayitPage() {
  return (
    <Suspense>
      <KayitContent />
    </Suspense>
  );
}

function KayitContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") === "pro" ? "PROFESSIONAL" : null;
  const initialProfessionalFlow = searchParams.get("mode") === "buy" ? "BUY_NOW" : "TRIAL";

  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "PROFESSIONAL" | null>(initialPlan as "PROFESSIONAL" | null);
  const [selectedProfessionalFlow, setSelectedProfessionalFlow] = useState<ProfessionalFlow>(initialProfessionalFlow);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedPlan === "PROFESSIONAL"
            ? { ...data, plan: "PROFESSIONAL", professionalFlow: selectedProfessionalFlow }
            : data
        ),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Kayıt başarısız");
        return;
      }

      const result = await res.json();
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (signInResult?.error) {
        toast.error("HesabÄ±nÄ±z oluÅŸtu ancak otomatik giriÅŸ baÅŸarÄ±sÄ±z oldu.");
        router.push("/giris");
        return;
      }

      if (result.requiresCheckout) {
        toast.success("HesabÄ±nÄ±z hazÄ±r. Ã–deme adÄ±mÄ±na yÃ¶nlendiriliyorsunuz.");
        window.location.href = "/api/billing/checkout-form?plan=PROFESSIONAL";
        return;
      }

      router.push("/onboarding");
      toast.success(selectedPlan === "PROFESSIONAL" ? "Hoş geldiniz! 14 günlük denemeniz başladı." : "Hoş geldiniz! Restoranınızı kuralım.");
    } finally {
      setLoading(false);
    }
  }

  const plan = PLANS.find((p) => p.id === selectedPlan);
  const PlanIcon = plan?.icon;
  const isProfessional = selectedPlan === "PROFESSIONAL";
  const selectedCta =
    isProfessional
      ? selectedProfessionalFlow === "BUY_NOW"
        ? "Hesabı Oluştur ve Ödemeye Geç"
        : "14 Gün Ücretsiz Dene"
      : plan?.cta;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Ana Sayfaya Dön
        </Link>

        <div className="flex flex-col items-center gap-2">
          <RestoPanLogo iconSize={48} />
        </div>

        {!selectedPlan ? (
          /* ── Adım 1: Plan seçimi ── */
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-xl font-bold">Planınızı seçin</h1>
              <p className="text-sm text-muted-foreground mt-1">İstediğiniz zaman değiştirebilirsiniz</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLANS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "relative text-left rounded-2xl border-2 p-5 transition-all",
                      p.highlight
                        ? "border-primary bg-white shadow-md shadow-primary/10"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    {p.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={cn("w-4 h-4", p.color)} />
                      <span className="font-bold">{p.name}</span>
                    </div>
                    <div className="mb-3">
                      <span className={cn("text-lg font-bold", p.color)}>{p.price}</span>
                      <span className="text-xs text-muted-foreground ml-1">{p.sub}</span>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {p.id === "PROFESSIONAL" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlan("PROFESSIONAL");
                            setSelectedProfessionalFlow("TRIAL");
                          }}
                          className="rounded-xl bg-primary text-white text-center py-2 text-sm font-semibold"
                        >
                          14 Gün Dene
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlan("PROFESSIONAL");
                            setSelectedProfessionalFlow("BUY_NOW");
                          }}
                          className="rounded-xl border border-primary/30 text-primary text-center py-2 text-sm font-semibold"
                        >
                          Satın Al
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedPlan(p.id as "STARTER")}
                        className={cn(
                          "w-full rounded-xl text-sm font-semibold transition-colors py-2",
                          p.highlight
                            ? "bg-primary text-white"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {p.cta}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
              <Link href="/giris" className="text-primary font-medium hover:underline">Giriş Yap</Link>
            </div>
          </div>
        ) : (
          /* ── Adım 2: Kayıt formu ── */
          <div className="space-y-4">
            <button
              onClick={() => {
                setSelectedPlan(null);
                setSelectedProfessionalFlow(initialProfessionalFlow);
              }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Plan seçimine dön
            </button>

            {plan && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium",
                plan.highlight ? "bg-primary/8 border-primary/20 text-primary" : "bg-slate-50 border-slate-200 text-slate-600"
              )}>
                {PlanIcon ? <PlanIcon className="w-4 h-4 flex-shrink-0" /> : null}
                <span>
                  {isProfessional
                    ? `${plan.name} — ${selectedProfessionalFlow === "BUY_NOW" ? "Direkt Satın Al" : plan.price}`
                    : `${plan.name} — ${plan.price}`}
                </span>
                <span className="text-xs font-normal opacity-70">
                  {isProfessional && selectedProfessionalFlow === "BUY_NOW" ? "· Hemen ödeme sayfasına geçiş" : plan.sub}
                </span>
              </div>
            )}

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Hesap Oluştur</CardTitle>
                <CardDescription>
                  {isProfessional
                    ? selectedProfessionalFlow === "BUY_NOW"
                      ? "Bilgilerinizi tamamlayın, hesabınız oluşsun ve doğrudan ödeme sayfasına geçin"
                      : "14 gün boyunca tüm özellikleri ücretsiz kullanın"
                    : "Kredi kartı gerekmez, süre sınırı yok"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {isProfessional && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProfessionalFlow("TRIAL")}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-left transition-colors",
                          selectedProfessionalFlow === "TRIAL"
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <p className="text-sm font-semibold">14 Gün Ücretsiz Dene</p>
                        <p className="mt-1 text-xs text-muted-foreground">Kart bilgisi vermeden tüm özellikleri test edin</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProfessionalFlow("BUY_NOW")}
                        className={cn(
                          "rounded-xl border px-3 py-3 text-left transition-colors",
                          selectedProfessionalFlow === "BUY_NOW"
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                      >
                        <p className="text-sm font-semibold">Satın Al</p>
                        <p className="mt-1 text-xs text-muted-foreground">Kaydı tamamlayıp doğrudan ödeme sayfasına geçin</p>
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Restoran Adı</Label>
                    <Input id="organizationName" placeholder="Örn: Lezzet Durağı" {...register("organizationName")} />
                    {errors.organizationName && <p className="text-xs text-destructive">{errors.organizationName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input id="name" placeholder="Ahmet Yılmaz" {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input id="email" type="email" placeholder="ornek@restoran.com" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input id="password" type="password" placeholder="En az 6 karakter" {...register("password")} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {selectedCta}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
                  <Link href="/giris" className="text-primary font-medium hover:underline">Giriş Yap</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
