"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Zap } from "lucide-react";
import { toast } from "sonner";

interface Props {
  reason: "expired" | "past_due" | "canceled";
  planName: string;
}

const MESSAGES = {
  expired: {
    title: "Deneme Süreniz Doldu",
    body: "14 günlük ücretsiz deneme süreniz sona erdi. Restoranınıza erişmeye devam etmek için bir plan seçin.",
  },
  past_due: {
    title: "Ödeme Başarısız",
    body: "Son ödemeniz işleme alınamadı. Lütfen ödeme bilgilerinizi güncelleyin.",
  },
  canceled: {
    title: "Aboneliğiniz İptal Edildi",
    body: "Aboneliğiniz sona erdi. Restoranınıza erişmeye devam etmek için bir plan seçin.",
  },
};

export function SubscriptionGate({ reason }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const msg = MESSAGES[reason];

  async function handleUpgrade(plan: "PROFESSIONAL" | "ENTERPRISE") {
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error();
    } catch {
      toast.error("Yönlendirme başarısız");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error();
    } catch {
      toast.error("Portal açılamadı");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{msg.title}</h1>
          <p className="text-muted-foreground">{msg.body}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold">Professional</span>
            </div>
            <p className="text-2xl font-bold">₺999<span className="text-sm font-normal text-muted-foreground">/ay</span></p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>50 masa · 10 kullanıcı</li>
              <li>3 şube · Tüm özellikler</li>
            </ul>
            <Button
              className="w-full"
              size="sm"
              onClick={() => handleUpgrade("PROFESSIONAL")}
              disabled={!!loading}
            >
              {loading === "PROFESSIONAL" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Seç
            </Button>
          </div>

          <div className="border-2 border-primary rounded-2xl p-5 text-left space-y-3 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">Sınırsız</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-600" />
              <span className="font-semibold">Enterprise</span>
            </div>
            <p className="text-2xl font-bold">₺2.499<span className="text-sm font-normal text-muted-foreground">/ay</span></p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Sınırsız masa & kullanıcı</li>
              <li>Öncelikli destek</li>
            </ul>
            <Button
              className="w-full"
              size="sm"
              variant="outline"
              onClick={() => handleUpgrade("ENTERPRISE")}
              disabled={!!loading}
            >
              {loading === "ENTERPRISE" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Seç
            </Button>
          </div>
        </div>

        {reason === "past_due" && (
          <Button variant="link" size="sm" onClick={handlePortal} disabled={!!loading} className="text-muted-foreground">
            {loading === "portal" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Ödeme bilgilerini güncelle
          </Button>
        )}
      </div>
    </div>
  );
}
