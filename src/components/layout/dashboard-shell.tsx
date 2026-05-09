"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { Menu, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { PlanType } from "@/lib/plan-limits";
import { useSSE } from "@/hooks/use-events";
import { toast } from "sonner";

interface DashboardShellProps {
  children: React.ReactNode;
  plan: PlanType;
  trialDaysLeft?: number;
  gateNode?: React.ReactNode;
}

export function DashboardShell({ children, plan, trialDaysLeft, gateNode }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setSidebarCollapsed(saved === "true");
  }, []);

  useSSE({
    "order:ready": (data: unknown) => {
      const d = data as { orderNumber: string; tableName?: string | null };
      const table = d.tableName ? ` · ${d.tableName}` : "";
      toast.success(`🍽 Sipariş Hazır — ${d.orderNumber}${table}`, {
        description: "Mutfaktan çıktı, servis edilebilir",
        duration: 10000,
      });
    },
  });

  function toggleCollapsed() {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {gateNode}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <AppSidebar
        plan={plan}
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileOpen}
        onToggle={toggleCollapsed}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex md:hidden items-center h-[56px] px-4 border-b bg-sidebar text-sidebar-foreground shrink-0 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-sidebar-foreground">RestoPAN</span>
        </div>

        {trialDaysLeft && (
          <div className={`border-b px-4 py-2 flex items-center justify-between shrink-0 ${
            trialDaysLeft <= 3
              ? "bg-red-50 border-red-200"
              : trialDaysLeft <= 7
              ? "bg-orange-50 border-orange-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className={`flex items-center gap-2 text-sm ${
              trialDaysLeft <= 3 ? "text-red-800" : trialDaysLeft <= 7 ? "text-orange-800" : "text-amber-800"
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                {trialDaysLeft <= 3
                  ? <>Professional deneme süreniz <strong>{trialDaysLeft} gün</strong> içinde bitiyor! Verilerinizi kaybetmemek için hemen satın alın.</>
                  : <>Professional denemenizin bitmesine <strong>{trialDaysLeft} gün</strong> kaldı.</>
                }
              </span>
            </div>
            <Link
              href="/dashboard/ayarlar/fatura"
              className={`text-xs font-semibold underline underline-offset-2 shrink-0 ml-4 ${
                trialDaysLeft <= 3 ? "text-red-900 hover:text-red-700" : trialDaysLeft <= 7 ? "text-orange-900 hover:text-orange-700" : "text-amber-900 hover:text-amber-700"
              }`}
            >
              Satın Al →
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
