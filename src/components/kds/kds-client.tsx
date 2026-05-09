"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Clock, CheckCircle, ChefHat, Flame, Maximize2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useOrderSound } from "@/hooks/use-order-sound";

interface KitchenTicket {
  id: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: number;
  createdAt: Date;
  order: {
    orderNumber: string;
    type: string;
    notes?: string | null;
    table?: { name: string } | null;
    items: Array<{
      id: string;
      quantity: number;
      notes?: string | null;
      status: string;
      menuItem: { name: string; preparationTime?: number | null };
      modifiers: Array<{ modifier: { name: string } }>;
    }>;
  };
}

function useElapsed(createdAt: Date) {
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);
  return elapsed;
}

function ElapsedTimer({ createdAt }: { createdAt: Date }) {
  const elapsed = useElapsed(createdAt);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const isUrgent = minutes >= 10;
  const isWarning = minutes >= 5;

  return (
    <span className={cn(
      "font-mono font-black text-2xl tabular-nums",
      isUrgent ? "text-red-400 animate-pulse" : isWarning ? "text-amber-400" : "text-emerald-400"
    )}>
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </span>
  );
}

function TicketCard({ ticket, onStatusChange }: { ticket: KitchenTicket; onStatusChange: (id: string, status: string) => void }) {
  const isInProgress = ticket.status === "IN_PROGRESS";
  const isPending = ticket.status === "PENDING";

  return (
    <div className={cn(
      "rounded-2xl border-2 bg-gray-900 flex flex-col transition-all",
      isPending ? "border-amber-400" : "border-blue-400"
    )}>
      {/* Status Badge + Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2.5 rounded-t-2xl",
        isPending ? "bg-amber-400/20" : "bg-blue-400/20"
      )}>
        <div className="flex items-center gap-2.5">
          <span className="font-black text-2xl text-white">{ticket.order.orderNumber}</span>
          {ticket.order.table && (
            <Badge className="text-sm h-6 px-2.5 bg-gray-700 text-gray-200 border-gray-600">
              {ticket.order.table.name}
            </Badge>
          )}
          {ticket.order.type !== "DINE_IN" && (
            <Badge className="text-sm h-6 px-2.5 bg-purple-600">
              {ticket.order.type === "TAKEOUT" ? "Paket" : "Kurye"}
            </Badge>
          )}
          {ticket.priority > 0 && <Flame className="w-5 h-5 text-red-400" />}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <ElapsedTimer createdAt={ticket.createdAt} />
        </div>
      </div>

      {/* Durum etiketi */}
      <div className={cn(
        "mx-4 mt-3 mb-1 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2",
        isPending
          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
          : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
      )}>
        {isPending ? (
          <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" /> Sırada Bekliyor — Başlamak için aşağıdaki butona basın</>
        ) : (
          <><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" /> Hazırlanıyor — Tamamlandığında &quot;Hazır&quot; basın</>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 p-4 pt-3 space-y-3">
        {ticket.order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="font-black text-3xl leading-none text-white w-10 flex-shrink-0">
              {item.quantity}×
            </span>
            <div className="flex-1">
              <p className="font-bold text-lg text-white leading-tight">
                {item.menuItem.name}
              </p>
              {item.modifiers.length > 0 && (
                <p className="text-sm text-gray-400 mt-0.5">
                  + {item.modifiers.map((m) => m.modifier.name).join(", ")}
                </p>
              )}
              {item.notes && (
                <p className="text-sm text-amber-300 font-semibold mt-0.5">
                  ⚠ {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}

        {ticket.order.notes && (
          <div className="bg-amber-900/40 border border-amber-700 rounded-xl px-3 py-2 text-sm text-amber-300 mt-1">
            <span className="font-bold">Not: </span>
            {ticket.order.notes}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-4 pt-2">
        {isPending && (
          <button
            onClick={() => onStatusChange(ticket.id, "IN_PROGRESS")}
            className="w-full h-14 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2.5 text-white font-bold text-lg"
          >
            <ChefHat className="w-5 h-5" />
            Hazırlamaya Başla
          </button>
        )}
        {isInProgress && (
          <button
            onClick={() => onStatusChange(ticket.id, "DONE")}
            className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2.5 text-white font-bold text-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Hazır — Servise Gönder
          </button>
        )}
      </div>
    </div>
  );
}

export function KDSClient({ initialTickets }: { initialTickets: KitchenTicket[] }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useOrderSound(true);

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (e) => {
      try {
        const { event } = JSON.parse(e.data);
        if (event === "order:new") router.refresh();
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(interval);
  }, [router]);

  async function handleStatusChange(id: string, status: string) {
    try {
      await fetch(`/api/kitchen/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (status === "DONE") {
        // Kısa süre "Hazır" sütununda göster, sonra kaldır
        setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "DONE" as KitchenTicket["status"] } : t));
        setCompletedIds((prev) => new Set(prev).add(id));
        toast.success("Hazır! Garson bildirim alacak.");
        setTimeout(() => {
          setTickets((prev) => prev.filter((t) => t.id !== id));
          setCompletedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
        }, 8000);
      } else {
        setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: status as KitchenTicket["status"] } : t));
      }
    } catch {
      toast.error("Güncelleme başarısız");
    }
  }

  const pending = tickets.filter((t) => t.status === "PENDING");
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS");
  const done = tickets.filter((t) => t.status === "DONE");

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-black text-xl">Mutfak Ekranı</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.refresh()} className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Akış Göstergesi */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-0 flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-amber-300 font-bold text-sm">Sırada Bekliyor</span>
          <span className="ml-1 bg-amber-500/30 text-amber-200 text-xs font-black px-2 py-0.5 rounded-full">{pending.length}</span>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-600 mx-3 flex-shrink-0" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-blue-300 font-bold text-sm">Hazırlanıyor</span>
          <span className="ml-1 bg-blue-500/30 text-blue-200 text-xs font-black px-2 py-0.5 rounded-full">{inProgress.length}</span>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-600 mx-3 flex-shrink-0" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300 font-bold text-sm">Hazır — Servise Gidiyor</span>
          <span className="ml-1 bg-emerald-500/30 text-emerald-200 text-xs font-black px-2 py-0.5 rounded-full">{done.length}</span>
        </div>
      </div>

      {/* Kanban Sütunları */}
      <div className="flex-1 flex gap-0 overflow-hidden">

        {/* Sütun 1: Bekliyor */}
        <div className="flex-1 flex flex-col border-r border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800 bg-amber-500/5 flex-shrink-0">
            <p className="text-amber-400 font-bold text-sm uppercase tracking-wide">
              1 · Sırada Bekliyor
            </p>
            <p className="text-gray-500 text-xs mt-0.5">Yeni gelen siparişler — "Hazırlamaya Başla" basın</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-700">
                <CheckCircle className="w-10 h-10 opacity-20 mb-2" />
                <p className="text-sm">Bekleyen sipariş yok</p>
              </div>
            ) : (
              pending.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>

        {/* Sütun 2: Hazırlanıyor */}
        <div className="flex-1 flex flex-col border-r border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800 bg-blue-500/5 flex-shrink-0">
            <p className="text-blue-400 font-bold text-sm uppercase tracking-wide">
              2 · Hazırlanıyor
            </p>
            <p className="text-gray-500 text-xs mt-0.5">Mutfakta yapılıyor — tamamlanınca "Hazır" basın</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {inProgress.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-700">
                <ChefHat className="w-10 h-10 opacity-20 mb-2" />
                <p className="text-sm">Hazırlanan sipariş yok</p>
              </div>
            ) : (
              inProgress.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onStatusChange={handleStatusChange} />
              ))
            )}
          </div>
        </div>

        {/* Sütun 3: Hazır */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800 bg-emerald-500/5 flex-shrink-0">
            <p className="text-emerald-400 font-bold text-sm uppercase tracking-wide">
              3 · Hazır — Servise Gidiyor
            </p>
            <p className="text-gray-500 text-xs mt-0.5">Garson bildirim aldı — masaya götürülecek</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {done.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-700">
                <CheckCircle className="w-10 h-10 opacity-20 mb-2" />
                <p className="text-sm">Servis bekleyen yok</p>
              </div>
            ) : (
              done.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border-2 border-emerald-500 bg-emerald-950/30 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <span className="font-black text-xl text-white">{ticket.order.orderNumber}</span>
                    {ticket.order.table && (
                      <Badge className="bg-gray-700 text-gray-200 border-gray-600">{ticket.order.table.name}</Badge>
                    )}
                  </div>
                  <p className="text-emerald-300 font-bold text-sm">Garson bildirim aldı — servis bekleniyor</p>
                  <p className="text-gray-500 text-xs mt-1">Bu kart birkaç saniye içinde otomatik kapanır</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
