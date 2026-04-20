"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Clock, CheckCircle, ChefHat, Flame } from "lucide-react";
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
    <span
      className={cn(
        "font-mono text-sm font-bold",
        isUrgent ? "text-red-600 animate-pulse" : isWarning ? "text-amber-600" : "text-emerald-600"
      )}
    >
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </span>
  );
}

function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: KitchenTicket;
  onStatusChange: (id: string, status: string) => void;
}) {
  const isInProgress = ticket.status === "IN_PROGRESS";

  return (
    <div
      className={cn(
        "rounded-xl border-2 bg-card flex flex-col transition-all",
        ticket.status === "PENDING"
          ? "border-amber-300 bg-amber-50/30"
          : "border-primary bg-primary/5"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2.5 rounded-t-xl",
          ticket.status === "PENDING" ? "bg-amber-100" : "bg-primary/10"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{ticket.order.orderNumber}</span>
          {ticket.order.table && (
            <Badge variant="outline" className="text-xs h-5">
              {ticket.order.table.name}
            </Badge>
          )}
          {ticket.order.type !== "DINE_IN" && (
            <Badge className="text-xs h-5 bg-purple-500">
              {ticket.order.type === "TAKEOUT" ? "Paket" : "Kurye"}
            </Badge>
          )}
          {ticket.priority > 0 && (
            <Flame className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <ElapsedTimer createdAt={ticket.createdAt} />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 p-4 space-y-2">
        {ticket.order.items.map((item) => (
          <div key={item.id} className="space-y-0.5">
            <div className="flex items-start gap-2">
              <span className="font-bold text-lg leading-none w-6 flex-shrink-0">
                {item.quantity}×
              </span>
              <div className="flex-1">
                <p className="font-semibold text-sm leading-snug">
                  {item.menuItem.name}
                </p>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    + {item.modifiers.map((m) => m.modifier.name).join(", ")}
                  </p>
                )}
                {item.notes && (
                  <p className="text-xs text-amber-600 font-medium">
                    ⚠ {item.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {ticket.order.notes && (
          <div className="bg-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700 mt-2">
            <span className="font-semibold">Not: </span>
            {ticket.order.notes}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 pt-0 flex gap-2">
        {ticket.status === "PENDING" && (
          <Button
            className="flex-1 h-9 bg-amber-500 hover:bg-amber-600"
            onClick={() => onStatusChange(ticket.id, "IN_PROGRESS")}
          >
            <ChefHat className="w-4 h-4 mr-1.5" />
            Başla
          </Button>
        )}
        {ticket.status === "IN_PROGRESS" && (
          <Button
            className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600"
            onClick={() => onStatusChange(ticket.id, "DONE")}
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Hazır
          </Button>
        )}
      </div>
    </div>
  );
}

export function KDSClient({
  initialTickets,
}: {
  initialTickets: KitchenTicket[];
}) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS">("ALL");

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 15000);
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
        toast.success("Sipariş hazır olarak işaretlendi");
      } else {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: status as KitchenTicket["status"] } : t
          )
        );
      }
    } catch {
      toast.error("Güncelleme başarısız");
    }
  }

  const filtered = tickets.filter(
    (t) => filter === "ALL" || t.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* KDS Header */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-lg">Mutfak Ekranı</h1>
          <Badge className="bg-gray-800 text-gray-300 border-gray-700">
            {tickets.length} Aktif
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", "PENDING", "IN_PROGRESS"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                filter === f
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              {f === "ALL" ? "Tümü" : f === "PENDING" ? "Bekliyor" : "Hazırlanıyor"}
              <span className="ml-1.5 opacity-70">
                {f === "ALL"
                  ? tickets.length
                  : tickets.filter((t) => t.status === f).length}
              </span>
            </button>
          ))}
          <button
            onClick={() => router.refresh()}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600 gap-3">
            <CheckCircle className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium">Bekleyen sipariş yok</p>
            <p className="text-sm">Yeni siparişler otomatik olarak görünecek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filtered.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
