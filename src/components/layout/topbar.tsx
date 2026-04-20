"use client";

import { Bell, Search, Moon, Sun, X, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSSE } from "@/hooks/use-events";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  type: "order:new" | "order:ready";
  message: string;
  sub: string;
  at: Date;
  read: boolean;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const addNotif = useCallback((n: Omit<Notification, "id" | "at" | "read">) => {
    const notif: Notification = { ...n, id: crypto.randomUUID(), at: new Date(), read: false };
    setNotifications((prev) => [notif, ...prev].slice(0, 50));
    return notif;
  }, []);

  useSSE({
    "order:new": (data: unknown) => {
      const d = data as { orderNumber: string; totalAmount: number; type: string };
      const notif = addNotif({
        type: "order:new",
        message: `Yeni Sipariş — ${d.orderNumber}`,
        sub: `${formatCurrency(d.totalAmount)} · ${d.type === "DINE_IN" ? "Masa" : d.type === "TAKEOUT" ? "Paket" : "Teslimat"}`,
      });
      toast.info(notif.message, { description: notif.sub, duration: 5000 });
    },
    "order:ready": (data: unknown) => {
      const d = data as { orderNumber: string };
      const notif = addNotif({
        type: "order:ready",
        message: `Sipariş Hazır — ${d.orderNumber}`,
        sub: "Mutfaktan çıktı, servis edilebilir",
      });
      toast.success(notif.message, { description: notif.sub, duration: 6000 });
    },
  });

  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <header className="h-[60px] border-b border-border/60 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-[0_1px_3px_0_rgb(0,0,0,0.04)]">
      <div>
        <h1 className="text-[15px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-[11px] text-muted-foreground leading-tight">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Ara..." className="pl-9 w-52 h-9 bg-muted border-0" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative"
            onClick={() => { setOpen((v) => !v); if (!open) markAllRead(); }}
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                {unread > 9 ? "9+" : unread}
              </Badge>
            )}
          </Button>

          {open && (
            <div className="absolute right-0 top-11 w-80 bg-background border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="font-semibold text-sm">Bildirimler</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Bell className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-sm">Bildirim yok</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === "order:new" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {n.type === "order:new"
                          ? <ShoppingBag className="w-3.5 h-3.5" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.message}</p>
                        <p className="text-xs text-muted-foreground">{n.sub}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {n.at.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
