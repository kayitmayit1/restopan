"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Zap, ArrowDownCircle } from "lucide-react";

interface Props {
  reason: "expired" | "past_due" | "canceled";
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
  const [billingTermsChecked, setBillingTermsChecked] = useState(false);
  const msg = MESSAGES[reason];

  async function handleUpgrade(plan: "PROFESSIONAL") {
    if (!billingTermsChecked) {
      toast.error("Ödemeye geçmeden önce sözleşme onay kutusunu işaretleyin.");
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, acceptedTerms: true as const }),
      });
      let data: { url?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* empty */
      }
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Ödeme sayfasına gidilemedi.");
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
      } else {
        toast.error("Ödeme sayfası adresi alınamadı.");
      }
    } catch {
      toast.error("Yönlendirme başarısız");
    } finally {
      setLoading(null);
    }
  }

  async function handleDowngrade() {
    setLoading("downgrade");
    try {
      const res = await fetch("/api/billing/downgrade", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Starter plana geçildi");
      window.location.reload();
    } catch {
      toast.error("İşlem başarısız");
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

        <label className="flex items-start gap-2 text-left text-xs text-muted-foreground cursor-pointer mx-auto max-w-sm">
          <input
            type="checkbox"
            checked={billingTermsChecked}
            onChange={(e) => setBillingTermsChecked(e.target.checked)}
            className="mt-0.5 rounded border-gray-300"
          />
          <span>
            Ödeme yapmadan önce{" "}
            <Link href="/kullanim-kosullari" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              kullanım koşulları
            </Link>{" "}
            ve{" "}
            <Link
              href="/mesafeli-satis-sozlesmesi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mesafeli satış ön bilgilendirme ile sözleşme metinleri
            </Link>
            ’ni okudum, onaylıyorum.
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-primary rounded-2xl p-5 text-left space-y-3 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">En Popüler</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold">Professional</span>
            </div>
            <p className="text-2xl font-bold">₺999<span className="text-sm font-normal text-muted-foreground">/ay</span></p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>50 masa · 10 kullanıcı</li>
              <li>3 şube · Tüm özellikler</li>
              <li>WhatsApp destek (09:00–22:00)</li>
            </ul>
            <Button
              className="w-full"
              size="sm"
              onClick={() => handleUpgrade("PROFESSIONAL")}
              disabled={!!loading || !billingTermsChecked}
            >
              {loading === "PROFESSIONAL" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Seç
            </Button>
          </div>

          <div className="border rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-600" />
              <span className="font-semibold">Enterprise</span>
            </div>
            <p className="text-xl font-bold text-violet-600">Size özel</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Sınırsız masa & kullanıcı</li>
              <li>30 dk yanıt · Yerinde eğitim</li>
            </ul>
            <Button
              className="w-full"
              size="sm"
              variant="outline"
              onClick={() => window.location.href = "/iletisim"}
              disabled={!!loading}
            >
              Teklif Alın
            </Button>
          </div>
        </div>

        {reason === "expired" && (
          <button
            onClick={handleDowngrade}
            disabled={!!loading}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            {loading === "downgrade"
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ArrowDownCircle className="w-3.5 h-3.5" />
            }
            Hayır, Starter plana geç (ücretsiz, bazı özellikler kısıtlanır)
          </button>
        )}

        {reason === "past_due" && (
          <p className="text-sm text-muted-foreground">
            Ödeme sorunu için <a href="mailto:destek@restopan.com" className="underline">destek@restopan.com</a> ile iletişime geçin.
          </p>
        )}
      </div>
    </div>
  );
}
