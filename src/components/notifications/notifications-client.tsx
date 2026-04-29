"use client";

import { useState } from "react";
import { Bell, ShoppingCart, Calendar, AlertTriangle, Users, DollarSign, Info, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  ORDER:       { icon: ShoppingCart,   color: "text-blue-600",   bg: "bg-blue-50" },
  RESERVATION: { icon: Calendar,       color: "text-violet-600", bg: "bg-violet-50" },
  LOW_STOCK:   { icon: AlertTriangle,  color: "text-amber-600",  bg: "bg-amber-50" },
  STAFF:       { icon: Users,          color: "text-emerald-600",bg: "bg-emerald-50" },
  PAYMENT:     { icon: DollarSign,     color: "text-green-600",  bg: "bg-green-50" },
  SYSTEM:      { icon: Info,           color: "text-zinc-600",   bg: "bg-zinc-50" },
};

function getConfig(type: string) {
  return typeConfig[type] ?? { icon: Bell, color: "text-zinc-500", bg: "bg-zinc-50" };
}

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [
    { label: "Bugün", items: [] },
    { label: "Dün", items: [] },
    { label: "Daha Önce", items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d >= today) groups[0].items.push(n);
    else if (d >= yesterday) groups[1].items.push(n);
    else groups[2].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

export function NotificationsClient({ notifications: initial }: { notifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groups = groupByDate(notifications);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="font-medium text-muted-foreground">Bildirim yok</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Yeni bildirimler burada görünecek</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} okunmamış
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={loading} className="gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" />
            Tümünü Okundu Say
          </Button>
        )}
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {group.label}
            </p>
            <div className="bg-white border border-border/70 shadow-sm rounded-xl overflow-hidden divide-y divide-border/40">
              {group.items.map((n) => {
                const cfg = getConfig(n.type);
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.isRead && markRead(n.id)}
                    className={cn(
                      "w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30",
                      !n.isRead && "bg-primary/[0.03]"
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm", !n.isRead ? "font-semibold" : "font-medium text-muted-foreground")}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap flex-shrink-0 mt-0.5">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
