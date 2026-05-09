"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDateTime } from "@/lib/utils";
import { ReservationStatus, TableStatus } from "@prisma/client";
import { Plus, Calendar, Clock, Users, Phone, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { AddReservationModal } from "./add-reservation-modal";

const statusConfig: Record<ReservationStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: "Bekliyor",    color: "text-amber-700",  bg: "bg-amber-100" },
  CONFIRMED:  { label: "Onaylandı",  color: "text-blue-700",   bg: "bg-blue-100" },
  SEATED:     { label: "Oturdu",     color: "text-emerald-700",bg: "bg-emerald-100" },
  COMPLETED:  { label: "Tamamlandı", color: "text-gray-600",   bg: "bg-gray-100" },
  CANCELLED:  { label: "İptal",      color: "text-red-700",    bg: "bg-red-100" },
  NO_SHOW:    { label: "Gelmedi",    color: "text-red-500",    bg: "bg-red-50" },
};

interface Table { id: string; name: string; capacity: number; status: TableStatus }
interface Reservation {
  id: string; guestName: string; guestPhone?: string | null; guestCount: number;
  date: Date; duration: number; status: ReservationStatus; notes?: string | null;
  table?: { id: string; name: string; capacity: number } | null;
  customer?: { name: string; phone?: string | null } | null;
}

interface ReservationsClientProps {
  reservations: Reservation[];
  tables: Table[];
  locationId: string;
}

export function ReservationsClient({ reservations: initialRes, tables, locationId }: ReservationsClientProps) {
  const [reservations, setReservations] = useState(initialRes);
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date();
  const upcoming = reservations.filter(
    (r) => new Date(r.date) >= today && !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(r.status)
  );
  const past = reservations.filter(
    (r) => new Date(r.date) < today || ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(r.status)
  );

  async function updateStatus(id: string, status: ReservationStatus) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast.success("Durum güncellendi");
    } catch { toast.error("Güncelleme başarısız"); }
  }

  function ReservationCard({ r }: { r: Reservation }) {
    const sc = statusConfig[r.status];
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{r.guestName}</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", sc.color, sc.bg)}>
                  {sc.label}
                </span>
              </div>
              <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />{formatDateTime(r.date)}
                </p>
                <p className="flex items-center gap-1.5">
                  <Users className="w-3 h-3" />{r.guestCount} kişi
                </p>
                {r.table && (
                  <p className="flex items-center gap-1.5">
                    <LayoutGrid className="w-3 h-3" />{r.table.name}
                  </p>
                )}
                {r.guestPhone && (
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{r.guestPhone}</p>
                )}
                {r.notes && <p className="text-amber-600">Not: {r.notes}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {r.status === "PENDING" && (
                <Button size="sm" className="h-7 text-xs" onClick={() => updateStatus(r.id, "CONFIRMED")}>
                  Onayla
                </Button>
              )}
              {r.status === "CONFIRMED" && (
                <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => updateStatus(r.id, "SEATED")}>
                  Oturt
                </Button>
              )}
              {["PENDING", "CONFIRMED"].includes(r.status) && (
                <Button size="sm" variant="outline" className="h-7 text-xs text-destructive"
                  onClick={() => updateStatus(r.id, "CANCELLED")}>
                  İptal
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Yaklaşan</p>
            <p className="text-2xl font-bold">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bekleyen Onay</p>
            <p className="text-2xl font-bold text-amber-600">
              {reservations.filter((r) => r.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bugünkü</p>
            <p className="text-2xl font-bold text-primary">
              {reservations.filter((r) => new Date(r.date).toDateString() === today.toDateString()).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />Rezervasyon Al
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Yaklaşan ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Geçmiş ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.length === 0 ? (
              <p className="col-span-3 text-center py-8 text-muted-foreground">Yaklaşan rezervasyon yok</p>
            ) : upcoming.map((r) => <ReservationCard key={r.id} r={r} />)}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((r) => <ReservationCard key={r.id} r={r} />)}
          </div>
        </TabsContent>
      </Tabs>

      {showAdd && (
        <AddReservationModal
          locationId={locationId}
          tables={tables}
          onClose={() => setShowAdd(false)}
          onSaved={(r) => {
            setReservations((prev) => [r, ...prev]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
