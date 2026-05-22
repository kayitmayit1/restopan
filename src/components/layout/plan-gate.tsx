import Link from "next/link";
import { Lock, Zap } from "lucide-react";

interface Props {
  feature: string;
  requiredPlan?: "PROFESSIONAL" | "ENTERPRISE";
}

const FEATURE_LABELS: Record<string, string> = {
  analytics: "Analitik & Raporlar",
  finance: "Finans Raporları",
  kasa: "Kasa Yönetimi",
  "online-order": "Online Sipariş & QR Menü",
  campaigns: "Kampanyalar & İndirimler",
  customers: "Müşteri CRM",
  suppliers: "Tedarikçi Yönetimi",
};

export function PlanGate({ feature, requiredPlan = "PROFESSIONAL" }: Props) {
  const label = FEATURE_LABELS[feature] ?? feature;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-primary" />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">{label}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Bu özellik <strong>{requiredPlan === "PROFESSIONAL" ? "Professional" : "Enterprise"}</strong> planında
            kullanılabilir. Planınızı yükselterek tüm özelliklere erişin.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Zap className="w-4 h-4" />
            Professional — ₺999/ay
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 pl-6">
            <li>Analitik & finansal raporlar</li>
            <li>Online sipariş & QR menü</li>
            <li>Kampanyalar & müşteri CRM</li>
            <li>Tedarikçi yönetimi</li>
            <li>WhatsApp destek (09:00–22:00)</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 rounded-xl border text-sm font-medium text-center hover:bg-muted transition-colors"
          >
            Geri Dön
          </Link>
          <Link
            href="/dashboard/ayarlar/fatura"
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Planı Yükselt
          </Link>
        </div>
      </div>
    </div>
  );
}
