"use client";

import { useState, useEffect, useCallback } from "react";
import { useSSE } from "@/hooks/use-events";
import { Bell, CheckCircle2, Banknote, CreditCard, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface TableRequest {
  id: string;
  tableName?: string | null;
  type: string;
  paymentMethod?: string | null;
  createdAt: string;
}

const typeConfig = {
  WAITER: { label: "Garson Çağrıldı", icon: UtensilsCrossed, color: "bg-blue-50 border-blue-200 text-blue-700" },
  BILL: { label: "Hesap İstendi", icon: Banknote, color: "bg-amber-50 border-amber-200 text-amber-700" },
};

export function TableRequestsPanel() {
  const [requests, setRequests] = useState<TableRequest[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/table-requests");
      if (res.ok) setRequests(await res.json());
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  useSSE({
    "table:request": (data) => {
      const req = data as TableRequest;
      setRequests((prev) => [...prev, req]);
    },
  });

  async function markDone(id: string) {
    await fetch(`/api/table-requests/${id}`, { method: "PATCH" });
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  if (loaded && requests.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Masa İstekleri</h3>
        {requests.length > 0 && (
          <span className="ml-auto text-xs bg-primary text-white rounded-full px-2 py-0.5 font-bold">
            {requests.length}
          </span>
        )}
      </div>
      <div className="divide-y">
        {requests.map((req) => {
          const cfg = typeConfig[req.type as keyof typeof typeConfig] ?? typeConfig.WAITER;
          const Icon = cfg.icon;
          return (
            <div key={req.id} className="flex items-center gap-3 px-4 py-3">
              <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center", cfg.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {req.tableName ? `${req.tableName} — ` : ""}{cfg.label}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {req.type === "BILL" && req.paymentMethod && (
                    <>
                      {req.paymentMethod === "CASH" ? (
                        <Banknote className="w-3 h-3" />
                      ) : (
                        <CreditCard className="w-3 h-3" />
                      )}
                      {req.paymentMethod === "CASH" ? "Nakit" : "Kart"}
                      {" · "}
                    </>
                  )}
                  {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: tr })}
                </p>
              </div>
              <button
                onClick={() => markDone(req.id)}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Tamamlandı"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
