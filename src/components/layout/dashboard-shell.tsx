"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./app-sidebar";
import { Menu, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { PlanType } from "@/lib/plan-limits";

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
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Deneme sürenizin bitmesine <strong>{trialDaysLeft} gün</strong> kaldı.
              </span>
            </div>
            <Link
              href="/dashboard/ayarlar/fatura"
              className="text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-amber-700"
            >
              Planı Yükselt →
            </Link>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
