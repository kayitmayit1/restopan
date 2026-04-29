"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  ChefHat,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  UtensilsCrossed,
  LayoutGrid,
  Users,
  ShoppingCart,
} from "lucide-react";

const STORAGE_KEY = "rp-onboarding-dismissed-v1";

interface Props {
  hasMenu: boolean;
  hasTables: boolean;
  hasStaff: boolean;
}

const STEPS = [
  {
    id: "menu",
    emoji: "🍽️",
    icon: UtensilsCrossed,
    title: "Menünü oluştur",
    desc: "Kategori ve ürün ekle, fiyatları belirle.",
    href: "/dashboard/menu",
    cta: "Menüye git",
    bubble: "İlk adım olarak menünü hazırla! Kategoriler oluştur, yemeklerini ekle. Ne kadar lezzetli görünüyor? 😋",
    gradient: "from-orange-400 to-amber-400",
    light: "bg-orange-50 border-orange-200",
    text: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-400",
  },
  {
    id: "tables",
    emoji: "🪑",
    icon: LayoutGrid,
    title: "Masalarını ekle",
    desc: "Salon planını oluştur, masaları yerleştir.",
    href: "/dashboard/masalar",
    cta: "Masalara git",
    bubble: "Restoranını harita gibi çiz! Masalarını ekle, salonunu düzenle. Hem şık hem pratik! 🗺️",
    gradient: "from-blue-400 to-cyan-400",
    light: "bg-blue-50 border-blue-200",
    text: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
  },
  {
    id: "staff",
    emoji: "👨‍🍳",
    icon: Users,
    title: "Personel davet et",
    desc: "Garson, kasiyer, aşçı ekle ve görev ver.",
    href: "/dashboard/personel",
    cta: "Personele git",
    bubble: "Ekibini oluştur! Her çalışana rol ver — garson, aşçı, kasiyer. Hepsi uyumlu çalışır 🤝",
    gradient: "from-violet-400 to-purple-500",
    light: "bg-violet-50 border-violet-200",
    text: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-400",
  },
  {
    id: "pos",
    emoji: "🛒",
    icon: ShoppingCart,
    title: "İlk siparişi al",
    desc: "Menü hazır, masalar var — hadi başlayalım!",
    href: "/dashboard/pos",
    cta: "POS'a git",
    bubble: "Her şey hazır, ilk siparişini almaya başla! Kasa açık, müşteriler bekliyor 🎉",
    gradient: "from-emerald-400 to-teal-500",
    light: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
  },
];

export function OnboardingGuide({ hasMenu, hasTables, hasStaff }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  useEffect(() => {
    const doneMap = [hasMenu, hasTables, hasStaff, hasMenu && hasTables && hasStaff];
    const first = doneMap.findIndex((d) => !d);
    setActiveStep(first === -1 ? 3 : first);
  }, [hasMenu, hasTables, hasStaff]);

  if (!mounted || dismissed) return null;

  const allBasicDone = hasMenu && hasTables && hasStaff;
  const doneMap = [hasMenu, hasTables, hasStaff, false];

  const completedCount = [hasMenu, hasTables, hasStaff].filter(Boolean).length;
  const progressPct = Math.round((completedCount / 3) * 100);

  const current = STEPS[activeStep] ?? STEPS[3];

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-slate-50 via-white to-primary/5 p-5 overflow-hidden">
      {/* blobs */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary/5" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-violet-500/5" />

      <button
        onClick={dismiss}
        aria-label="Kapat"
        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        <X className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {/* Header row: mascot + chat bubble */}
      <div className="flex items-start gap-3 mb-5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
        </div>

        {/* Chat bubbles column */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Name label */}
          <p className="text-[11px] font-semibold text-muted-foreground pl-1">
            RestoPAN Asistanı · şimdi
          </p>

          {/* Static welcome bubble */}
          <div className="bg-white rounded-2xl rounded-tl-none border shadow-sm px-4 py-2.5 max-w-sm">
            <p className="text-sm font-semibold text-gray-900">Hoş geldin! 🎉</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Restoranını kurmak için sadece <strong>{3 - completedCount} adım</strong> kaldı.
              Hızlıca halledelim!
            </p>
          </div>

          {/* Active step bubble */}
          <div className={`bg-gradient-to-r ${current.gradient} rounded-2xl rounded-tl-none px-4 py-2.5 max-w-sm shadow-sm`}>
            <p className="text-sm text-white leading-relaxed">{current.bubble}</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 pl-1">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[180px]">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              {completedCount}/3 tamamlandı
            </span>
          </div>
        </div>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {STEPS.map((step, i) => {
          const isLastStep = i === 3;
          const done = isLastStep ? false : doneMap[i];
          const isActive = i === activeStep;
          const isLocked = isLastStep && !allBasicDone;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(i)}
              disabled={isLocked}
              className={[
                "relative text-left rounded-xl border p-3 transition-all duration-200 cursor-pointer",
                isLocked ? "opacity-40 cursor-not-allowed" : "hover:shadow-md hover:-translate-y-0.5",
                done
                  ? "bg-gray-50 border-gray-200"
                  : isActive
                  ? `${step.light} shadow-sm`
                  : "bg-white border-gray-100 hover:border-gray-200",
              ].join(" ")}
            >
              {/* Done badge */}
              {done && (
                <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />
              )}
              {/* Active dot */}
              {!done && isActive && (
                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${step.dot} animate-pulse`} />
              )}

              <span className="text-xl leading-none mb-1.5 block">{step.emoji}</span>
              <p
                className={[
                  "text-xs font-semibold leading-tight",
                  done ? "text-gray-400 line-through" : "text-gray-800",
                ].join(" ")}
              >
                {step.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                {step.desc}
              </p>

              {!done && !isLocked && (
                <Link
                  href={step.href}
                  onClick={(e) => e.stopPropagation()}
                  className={`mt-2 inline-flex items-center gap-0.5 text-[11px] font-semibold ${step.text}`}
                >
                  {step.cta}
                  <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              )}
            </button>
          );
        })}
      </div>

      {/* All done banner */}
      {allBasicDone && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5">
          <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">
            Süper! Her şey hazır — ilk siparişini almaya başla!
          </p>
          <Link
            href="/dashboard/pos"
            className="ml-auto flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            POS Aç <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
