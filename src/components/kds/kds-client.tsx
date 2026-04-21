"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Clock, CheckCircle, ChefHat, Flame, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
      isPending ? "border-amber-400" : "border-primary"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-5 py-3 rounded-t-2xl",
        isPending ? "bg-amber-400/20" : "bg-primary/20"
      )}>
        <div className="flex items-center gap-3">
          <span className="font-black text-2xl text-white">{ticket.order.orderNumber}</span>
          {ticket.order.table && (
            <Badge className="text-base h-7 px-3 bg-gray-700 text-gray-200 border-gray-600">
              {ticket.order.table.name}
            </Badge>
          )}
          {ticket.order.type !== "DINE_IN" && (
            <Badge className="text-base h-7 px-3 bg-purple-600">
              {ticket.order.type === "TAKEOUT" ? "Paket" : "Kurye"}
            </Badge>
          )}
          {ticket.priority > 0 && (
            <Flame className="w-6 h-6 text-red-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <ElapsedTimer createdAt={ticket.createdAt} />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 p-5 space-y-4">
        {ticket.order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            <span className="font-black text-4xl leading-none text-white w-12 flex-shrink-0">
              {item.quantity}×
            </span>
            <div className="flex-1">
              <p className="font-bold text-xl text-white leading-tight">
                {item.menuItem.name}
              </p>
              {item.modifiers.length > 0 && (
                <p className="text-base text-gray-400 mt-1">
                  + {item.modifiers.map((m) => m.modifier.name).join(", ")}
                </p>
              )}
              {item.notes && (
                <p className="text-base text-amber-300 font-semibold mt-1">
                  ⚠ {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}

        {ticket.order.notes && (
          <div className="bg-amber-900/40 border border-amber-700 rounded-xl px-4 py-3 text-base text-amber-300 mt-2">
            <span className="font-bold">Not: </span>
            {ticket.order.notes}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-4 pt-0">
        {isPending && (
          <button
            onClick={() => onStatusChange(ticket.id, "IN_PROGRESS")}
            className="w-full h-16 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-3 text-white font-bold text-xl"
          >
            <ChefHat className="w-6 h-6" />
            Başla
          </button>
        )}
        {isInProgress && (
          <button
            onClick={() => onStatusChange(ticket.id, "DONE")}
            className="w-full h-16 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-3 text-white font-bold text-xl"
          >
            <CheckCircle className="w-6 h-6" />
            Hazır
          </button>
        )}
      </div>
    </div>
  );
}

export function KDSClient({ initialTickets }: { initialTickets: KitchenTicket[] }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS">("ALL");

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 10000);
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
        setTickets((prev) => prev.filter((t) => t.id !== id));
        toast.success("Hazır olarak işaretlendi");
      } else {
        setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: status as KitchenTicket["status"] } : t));
      }
    } catch {
      toast.error("Güncelleme başarısız");
    }
  }

  const filtered = tickets.filter((t) => filter === "ALL" || t.status === filter);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* KDS Header */}
      <div className="h-20 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-black text-2xl">Mutfak</h1>
          <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-base h-8 px-3">
            {tickets.length} Aktif
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {(["ALL", "PENDING", "IN_PROGRESS"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-base font-semibold transition-colors",
                filter === f ? "bg-primary text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {f === "ALL" ? "Tümü" : f === "PENDING" ? "Bekliyor" : "Hazırlanıyor"}
              <span className="ml-2 opacity-70">
                {f === "ALL" ? tickets.length : tickets.filter((t) => t.status === f).length}
              </span>
            </button>
          ))}
          <button
            onClick={() => router.refresh()}
            className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Maximize2 className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="flex-1 p-5 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-700 gap-4">
            <CheckCircle className="w-24 h-24 opacity-20" />
            <p className="text-2xl font-bold">Bekleyen sipariş yok</p>
            <p className="text-lg">Yeni siparişler otomatik görünecek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
