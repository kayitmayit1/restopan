"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, Plus } from "lucide-react";

type Platform = "android" | "ios" | "desktop" | null;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "rp-pwa-install-dismissed";
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

function isDismissed(): boolean {
  try {
    const val = localStorage.getItem(DISMISSED_KEY);
    if (!val) return false;
    return Date.now() - parseInt(val, 10) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function getPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function PWAInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (isDismissed()) return;

    const p = getPlatform();
    setPlatform(p);

    if (p === "android" || p === "desktop") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    if (p === "ios") {
      // Show iOS guide after 3 seconds on first visit
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, String(Date.now())); } catch { /* ignore */ }
    setShowPrompt(false);
    setShowIOSGuide(false);
  }

  async function install() {
    if (!deferredPrompt) {
      setShowIOSGuide(true);
      return;
    }
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setInstalling(false);
    setDeferredPrompt(null);
  }

  if (!showPrompt || !platform) return null;

  return (
    <>
      {/* Main banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] p-3 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-white rounded-2xl border shadow-2xl shadow-black/15 overflow-hidden">
          {/* Orange top bar */}
          <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-400" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-black text-lg leading-none">R</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">RestoPAN'ı Yükle</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Ana ekrana ekle — uygulama gibi açılır, internet olmadan çalışır.
                </p>
              </div>

              <button
                onClick={dismiss}
                className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={dismiss}
                className="flex-1 py-2 rounded-xl border text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Şimdi değil
              </button>
              <button
                onClick={platform === "ios" ? () => setShowIOSGuide(true) : install}
                disabled={installing}
                className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {installing ? "Yükleniyor…" : "Ana Ekrana Ekle"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS step-by-step guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-400" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold">Ana Ekrana Ekle (iOS)</p>
                <button
                  onClick={dismiss}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: <Share className="w-5 h-5 text-blue-500" />,
                    step: "1",
                    title: "Paylaş butonuna bas",
                    desc: 'Safari\'nin alt menüsündeki "Paylaş" (kare + ok) ikonuna dokun.',
                  },
                  {
                    icon: <Plus className="w-5 h-5 text-blue-500" />,
                    step: "2",
                    title: "\"Ana Ekrana Ekle\" seç",
                    desc: 'Açılan menüde aşağı kaydır ve "Ana Ekrana Ekle" seçeneğine dokun.',
                  },
                  {
                    icon: <Download className="w-5 h-5 text-orange-500" />,
                    step: "3",
                    title: "Ekle'ye bas",
                    desc: 'Sağ üstteki "Ekle" butonuna dokun. RestoPAN artık ana ekranda!',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={dismiss}
                className="w-full mt-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
