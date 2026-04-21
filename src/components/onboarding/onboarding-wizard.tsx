"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ChefHat, Building2, LayoutGrid, BookOpen,
  ArrowRight, Check, Loader2, Minus, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "profile", label: "İşletme", icon: Building2 },
  { id: "tables", label: "Masalar", icon: LayoutGrid },
  { id: "menu", label: "Menü", icon: BookOpen },
];

const BUSINESS_TYPES = [
  { id: "restoran", emoji: "🍽️", label: "Restoran" },
  { id: "kafe", emoji: "☕", label: "Kafe" },
  { id: "fastfood", emoji: "🍔", label: "Fast Food" },
  { id: "bar", emoji: "🍺", label: "Bar / Pub" },
  { id: "pastane", emoji: "🥐", label: "Pastane" },
  { id: "diger", emoji: "🏪", label: "Diğer" },
];

const TAX_RATES = [
  { value: 0, label: "%0" },
  { value: 10, label: "%10" },
  { value: 20, label: "%20" },
];

const CURRENCIES = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
  { value: "GBP", label: "£ GBP" },
];

const MENU_TEMPLATES = [
  { id: "turk", emoji: "🍖", label: "Türk Restoranı", sub: "Kebap · Meze · Çorba" },
  { id: "pizza", emoji: "🍕", label: "Pizzacı", sub: "Pizza · Makarna · Antipasti" },
  { id: "kafe", emoji: "☕", label: "Kafe & Brunch", sub: "Kahve · Kahvaltı · Tatlı" },
  { id: "burger", emoji: "🍔", label: "Burger", sub: "Burger · Yan · İçecek" },
];

const TABLE_PREFIXES = ["Masa", "Salon", "Teras", "VIP", "Bahçe"];

interface Props {
  organizationId: string;
  userName: string;
}

export function OnboardingWizard({ organizationId, userName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Step 0 — İşletme
  const [businessType, setBusinessType] = useState<string>("restoran");
  const [locationName, setLocationName] = useState("Ana Şube");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [taxRate, setTaxRate] = useState(10);

  // Step 1 — Masalar
  const [tableCount, setTableCount] = useState(10);
  const [tablePrefix, setTablePrefix] = useState("Masa");
  const [tableCapacity, setTableCapacity] = useState(4);

  // Step 2 — Menü
  const [menuTemplate, setMenuTemplate] = useState<string | null>(null);

  async function handleFinish() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName, phone, address, currency, taxRate, businessType,
          tableCount, tablePrefix, tableCapacity,
        }),
      });
      if (!res.ok) throw new Error();

      if (menuTemplate) {
        const { TEMPLATES } = await import("@/components/menu/template-data");
        const tpl = TEMPLATES.find((t) => t.id === menuTemplate);
        if (tpl) {
          await fetch("/api/menu/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organizationId, categories: tpl.categories }),
          });
        }
      }

      setDone(true);
    } catch {
      toast.error("Bir hata oluştu, lütfen tekrar deneyin");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Her şey hazır!</h1>
          <p className="text-muted-foreground mb-8">
            Restoranınız kuruldu. Dashboard'da sizi bekliyoruz.
          </p>
          <Button size="lg" className="gap-2 px-8" onClick={() => router.push("/dashboard")}>
            Dashboard'a Git
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b bg-white/70 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm">RestoPan</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Atla, sonra kurarım →
        </button>
      </div>

      {/* Step progress */}
      <div className="flex justify-center py-8">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const isCompleted = i < step;
            const isActive = i === step;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                    isCompleted ? "bg-primary text-white"
                      : isActive ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={cn("text-[11px] font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("w-20 h-0.5 mb-4 mx-2 transition-all", isCompleted ? "bg-primary" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-lg">

          {/* ─── STEP 0: İşletme ─── */}
          {step === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Hoş geldiniz, {userName.split(" ")[0]}!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  İşletmenizi tanımlayalım.
                </p>
              </div>

              {/* İşletme tipi */}
              <div className="space-y-2">
                <Label>İşletme Tipi</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BUSINESS_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBusinessType(t.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all",
                        businessType === t.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Şube adı */}
              <div className="space-y-2">
                <Label>Şube / Lokasyon Adı</Label>
                <Input
                  placeholder="Ana Şube, Merkez, Kadıköy Şubesi..."
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value || "Ana Şube")}
                />
              </div>

              {/* Telefon & Adres */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    type="tel"
                    placeholder="0212 000 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Para Birimi</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCurrency(c.value)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                          currency === c.value ? "bg-primary text-white border-primary" : "hover:bg-muted"
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adres</Label>
                <Input
                  placeholder="Mahalle, Cadde No, İlçe/İl"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* KDV */}
              <div className="space-y-2">
                <Label>KDV Oranı</Label>
                <div className="flex gap-2">
                  {TAX_RATES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTaxRate(t.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm font-semibold transition-colors",
                        taxRate === t.value ? "bg-primary text-white border-primary" : "hover:bg-muted"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Türkiye'de yiyecek için genellikle %10</p>
              </div>

              <Button className="w-full gap-2" onClick={() => setStep(1)}>
                Devam Et <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ─── STEP 1: Masalar ─── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Masa Düzeni</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Masalarınızı otomatik oluşturalım. Sonradan düzenleyebilirsiniz.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Kaç masa var?</Label>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setTableCount(Math.max(0, tableCount - 1))}
                      className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold w-12 text-center tabular-nums">{tableCount}</span>
                    <button type="button" onClick={() => setTableCount(Math.min(200, tableCount + 1))}
                      className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2 ml-2">
                      {[5, 10, 20, 30].map((n) => (
                        <button key={n} type="button" onClick={() => setTableCount(n)}
                          className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                            tableCount === n ? "bg-primary text-white border-primary" : "hover:bg-muted")}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Masa adı öneki</Label>
                  <div className="flex flex-wrap gap-2">
                    {TABLE_PREFIXES.map((p) => (
                      <button key={p} type="button" onClick={() => setTablePrefix(p)}
                        className={cn("px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors",
                          tablePrefix === p ? "bg-primary text-white border-primary" : "hover:bg-muted")}>
                        {p}
                      </button>
                    ))}
                    <Input className="w-28 h-9" placeholder="Özel..."
                      value={TABLE_PREFIXES.includes(tablePrefix) ? "" : tablePrefix}
                      onChange={(e) => setTablePrefix(e.target.value || "Masa")} />
                  </div>
                  {tableCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Örnek: {tablePrefix} 1, {tablePrefix} 2, … {tablePrefix} {tableCount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Varsayılan kişi kapasitesi</Label>
                  <div className="flex gap-2">
                    {[2, 4, 6, 8].map((n) => (
                      <button key={n} type="button" onClick={() => setTableCapacity(n)}
                        className={cn("w-12 h-10 rounded-xl border text-sm font-semibold transition-colors",
                          tableCapacity === n ? "bg-primary text-white border-primary" : "hover:bg-muted")}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Geri</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(2)}>
                  Devam Et <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Menü ─── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold">Hazır Menü Şablonu</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Restoran tipinize göre başlangıç menüsü ekleyelim mi?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {MENU_TEMPLATES.map((t) => (
                  <button key={t.id} type="button"
                    onClick={() => setMenuTemplate(menuTemplate === t.id ? null : t.id)}
                    className={cn("text-left p-4 rounded-xl border-2 transition-all",
                      menuTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30")}>
                    <span className="text-2xl block mb-2">{t.emoji}</span>
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.sub}</p>
                    {menuTemplate === t.id && (
                      <div className="mt-2 flex items-center gap-1 text-primary">
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Seçildi</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Geri</Button>
                <Button className="flex-1 gap-2" onClick={handleFinish} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {loading ? "Kuruluyor…" : menuTemplate ? "Bitir & Başla" : "Menüsüz Başla"}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
