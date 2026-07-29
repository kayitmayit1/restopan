"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  orgId: string;
  currentPlan: string;
  activeSub: { id: string; status: string; currentPeriodEnd: Date } | null;
}

const plans = [
  { value: "STARTER", label: "Starter", desc: "Ücretsiz" },
  { value: "PROFESSIONAL", label: "Professional", desc: "₺599/ay" },
  { value: "ENTERPRISE", label: "Enterprise", desc: "₺2499/ay" },
];

export function OrgAdminActions({ orgId, currentPlan, activeSub }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trialDays, setTrialDays] = useState(14);

  async function changePlan(plan: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_plan", plan }),
      });
      if (!res.ok) throw new Error();
      toast.success("Plan güncellendi");
      router.refresh();
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  async function extendTrial() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extend_trial", days: trialDays }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Trial ${trialDays} gün uzatıldı`);
      router.refresh();
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  async function cancelSub() {
    if (!confirm("Aboneliği iptal etmek istediğinizden emin misiniz?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Abonelik iptal edildi");
      router.refresh();
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-border/70 shadow-sm rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-sm">Yönetim İşlemleri</h2>

      {/* Plan change */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Plan Değiştir</p>
        <div className="space-y-1.5">
          {plans.map((p) => (
            <button
              key={p.value}
              onClick={() => changePlan(p.value)}
              disabled={loading || currentPlan === p.value}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${currentPlan === p.value
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
                } disabled:opacity-50`}
            >
              <span>{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Extend trial */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Trial Uzat</p>
        <div className="flex gap-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden flex-1">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setTrialDays(d)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${trialDays === d ? "bg-primary text-white" : "hover:bg-muted"
                  }`}
              >
                {d}g
              </button>
            ))}
          </div>
          <Button size="sm" onClick={extendTrial} disabled={loading} className="flex-shrink-0">
            Uzat
          </Button>
        </div>
      </div>

      {/* Cancel */}
      {activeSub && activeSub.status !== "CANCELED" && (
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={cancelSub}
          disabled={loading}
        >
          Aboneliği İptal Et
        </Button>
      )}

      {activeSub && (
        <p className="text-[10px] text-muted-foreground text-center">
          Dönem sonu: {new Date(activeSub.currentPeriodEnd).toLocaleDateString("tr-TR")}
        </p>
      )}
    </div>
  );
}
