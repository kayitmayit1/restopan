"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Play, Square, Coffee, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClockEvent {
  id: string;
  type: "CLOCK_IN" | "CLOCK_OUT" | "BREAK_START" | "BREAK_END";
  time: string;
}

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
}

type ShiftState = "not_started" | "active" | "on_break" | "completed";

function getState(events: ClockEvent[]): ShiftState {
  if (events.length === 0) return "not_started";
  const last = events[events.length - 1];
  if (last.type === "CLOCK_OUT") return "completed";
  if (last.type === "BREAK_START") return "on_break";
  return "active";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function elapsed(fromIso: string) {
  const diffMs = Date.now() - new Date(fromIso).getTime();
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
}

export function ShiftWidget() {
  const [shift, setShift] = useState<Shift | null>(null);
  const [events, setEvents] = useState<ClockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/my-shift");
      const data = await res.json();
      setShift(data.shift);
      setEvents(data.clockEvents ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  async function clock(type: "CLOCK_IN" | "CLOCK_OUT" | "BREAK_START" | "BREAK_END") {
    setActing(true);
    try {
      const res = await fetch("/api/staff/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "İşlem başarısız");
        return;
      }
      await load();
      const labels: Record<string, string> = {
        CLOCK_IN: "Vardiyaya başlandı",
        CLOCK_OUT: "Vardiya tamamlandı",
        BREAK_START: "Mola başlatıldı",
        BREAK_END: "Moladan dönüldü",
      };
      toast.success(labels[type]);
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6 flex items-center justify-center h-40">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const state = getState(events);
  const clockIn = events.find((e) => e.type === "CLOCK_IN");
  const clockOut = events.find((e) => e.type === "CLOCK_OUT");
  const lastBreakStart = [...events].reverse().find((e) => e.type === "BREAK_START");
  const lastBreakEnd = [...events].reverse().find((e) => e.type === "BREAK_END");

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className={cn(
        "px-5 py-4 flex items-center gap-3",
        state === "not_started" && "bg-muted/50",
        state === "active" && "bg-emerald-50 border-b border-emerald-100",
        state === "on_break" && "bg-amber-50 border-b border-amber-100",
        state === "completed" && "bg-blue-50 border-b border-blue-100",
      )}>
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          state === "not_started" && "bg-muted",
          state === "active" && "bg-emerald-500",
          state === "on_break" && "bg-amber-500",
          state === "completed" && "bg-blue-500",
        )}>
          {state === "not_started" && <Clock className="w-4 h-4 text-muted-foreground" />}
          {state === "active" && <Clock className="w-4 h-4 text-white" />}
          {state === "on_break" && <Coffee className="w-4 h-4 text-white" />}
          {state === "completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
        <div>
          <p className="font-semibold text-sm">
            {state === "not_started" && "Bugün Vardiya"}
            {state === "active" && "Vardiyada"}
            {state === "on_break" && "Molada"}
            {state === "completed" && "Vardiya Tamamlandı"}
          </p>
          <p className="text-xs text-muted-foreground">
            {state === "not_started" && (shift ? `Planlanan: ${shift.startTime} – ${shift.endTime}` : "Planlanmış vardiya yok")}
            {state === "active" && clockIn && `Giriş: ${formatTime(clockIn.time)} · ${elapsed(clockIn.time)} önce`}
            {state === "on_break" && lastBreakStart && `Mola başladı: ${formatTime(lastBreakStart.time)}`}
            {state === "completed" && clockIn && clockOut && `${formatTime(clockIn.time)} – ${formatTime(clockOut.time)}`}
          </p>
        </div>

        {state === "active" && clockIn && (
          <div className="ml-auto text-right">
            <p className="text-lg font-bold text-emerald-600 tabular-nums" suppressHydrationWarning>
              {elapsed(clockIn.time)}
            </p>
            <p className="text-[10px] text-muted-foreground">çalışma süresi</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {events.length > 0 && (
        <div className="px-5 py-3 flex gap-4 text-xs text-muted-foreground border-b bg-muted/20 flex-wrap">
          {events.map((e) => {
            const labels: Record<string, string> = {
              CLOCK_IN: "Giriş", CLOCK_OUT: "Çıkış", BREAK_START: "Mola", BREAK_END: "Devam",
            };
            return (
              <span key={e.id} className="flex items-center gap-1">
                <span className="font-medium text-foreground">{labels[e.type]}</span>
                {formatTime(e.time)}
              </span>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        {state === "not_started" && (
          <button
            onClick={() => clock("CLOCK_IN")}
            disabled={acting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Vardiyaya Başla
          </button>
        )}

        {state === "active" && (
          <div className="flex gap-2">
            <button
              onClick={() => clock("BREAK_START")}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Coffee className="w-3.5 h-3.5" />}
              Mola Ver
            </button>
            <button
              onClick={() => clock("CLOCK_OUT")}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
              Vardiyayı Bitir
            </button>
          </div>
        )}

        {state === "on_break" && (
          <button
            onClick={() => clock("BREAK_END")}
            disabled={acting}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Moladan Dön
          </button>
        )}

        {state === "completed" && (
          <div className="text-center py-2 text-sm text-muted-foreground">
            Bugünkü vardiya tamamlandı. İyi çalışmalar! 👋
          </div>
        )}
      </div>
    </div>
  );
}
