"use client";

import { useState, useRef } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { TableStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, RefreshCw, LayoutGrid, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddTableModal } from "./add-table-modal";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  totalAmount: number;
  createdAt: Date;
  items: Array<{ menuItem: { name: string } }>;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  section?: string | null;
  posX: number;
  posY: number;
  width: number;
  height: number;
  shape: "RECTANGLE" | "CIRCLE" | "SQUARE";
  status: TableStatus;
  isActive: boolean;
  orders: Order[];
}

const statusConfig: Record<
  TableStatus,
  { label: string; bg: string; border: string; text: string }
> = {
  AVAILABLE: {
    label: "Boş",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
  },
  OCCUPIED: {
    label: "Dolu",
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
  },
  RESERVED: {
    label: "Rezerve",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
  },
  CLEANING: {
    label: "Temizleniyor",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
  },
  INACTIVE: {
    label: "Pasif",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-400",
  },
};

interface TableFloorPlanProps {
  tables: Table[];
  locationId: string;
  organizationId: string;
}

export function TableFloorPlan({
  tables: initialTables,
  locationId,
  organizationId,
}: TableFloorPlanProps) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const sections = Array.from(new Set(tables.map((t) => t.section || "Genel")));

  async function handleDelete(tableId: string) {
    try {
      const res = await fetch(`/api/tables/${tableId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      setSelectedTable(null);
      toast.success("Masa silindi");
    } catch {
      toast.error("Masa silinemedi");
    }
  }

  async function updateStatus(tableId: string, status: TableStatus) {
    try {
      await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status } : t))
      );
      setSelectedTable((prev) => (prev?.id === tableId ? { ...prev, status } : prev));
      toast.success("Masa durumu güncellendi");
    } catch {
      toast.error("Güncelleme başarısız");
    }
  }

  const stats = {
    total: tables.filter((t) => t.isActive).length,
    available: tables.filter((t) => t.status === "AVAILABLE").length,
    occupied: tables.filter((t) => t.status === "OCCUPIED").length,
    reserved: tables.filter((t) => t.status === "RESERVED").length,
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[
            { label: "Toplam", value: stats.total, color: "text-foreground" },
            { label: "Boş", value: stats.available, color: "text-emerald-600" },
            { label: "Dolu", value: stats.occupied, color: "text-red-600" },
            { label: "Rezerve", value: stats.reserved, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            className="gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Yenile
          </Button>
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className="gap-2"
          >
            <Settings className="w-3.5 h-3.5" />
            {editMode ? "Düzenlemeyi Bitir" : "Düzenle"}
          </Button>
          <Button size="sm" onClick={() => { setEditingTable(null); setShowTableModal(true); }} className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            Masa Ekle
          </Button>
        </div>
      </div>

      {/* Floor Plan Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {sections.map((section) => (
            <div key={section} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                {section}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {tables
                  .filter((t) => (t.section || "Genel") === section && t.isActive)
                  .sort((a, b) => {
                    const na = parseInt(a.name, 10);
                    const nb = parseInt(b.name, 10);
                    if (!isNaN(na) && !isNaN(nb)) return na - nb;
                    return a.name.localeCompare(b.name, "tr");
                  })
                  .map((table) => {
                    const cfg = statusConfig[table.status];
                    const isSelected = selectedTable?.id === table.id;
                    const activeOrder = table.orders[0];
                    return (
                      <button
                        key={table.id}
                        onClick={() =>
                          setSelectedTable(isSelected ? null : table)
                        }
                        className={cn(
                          "rounded-xl border-2 p-2.5 text-center transition-all space-y-1",
                          cfg.bg,
                          cfg.border,
                          isSelected && "ring-2 ring-primary ring-offset-2 scale-105",
                          "hover:scale-[1.02] active:scale-[0.98]"
                        )}
                      >
                        <p className="text-sm font-bold">{table.name}</p>
                        <p className={cn("text-[10px] font-medium", cfg.text)}>
                          {cfg.label}
                        </p>
                        {activeOrder && (
                          <p className="text-[10px] text-muted-foreground">
                            {formatCurrency(activeOrder.totalAmount)}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {table.capacity}p
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Table Detail Panel */}
        <div>
          {selectedTable ? (
            <div className="border rounded-xl p-4 space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedTable.name}</h3>
                <Badge
                  variant={
                    selectedTable.status === "OCCUPIED" ? "destructive" : "secondary"
                  }
                >
                  {statusConfig[selectedTable.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-muted-foreground text-xs">Kapasite</p>
                  <p className="font-medium">{selectedTable.capacity} kişi</p>
                </div>
                <div className="bg-muted rounded-lg p-2">
                  <p className="text-muted-foreground text-xs">Bölüm</p>
                  <p className="font-medium">{selectedTable.section || "Genel"}</p>
                </div>
              </div>

              {selectedTable.orders.length > 0 && (
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Aktif Sipariş
                  </p>
                  {selectedTable.orders[0].items.slice(0, 3).map((item, i) => (
                    <p key={i} className="text-sm">
                      {item.menuItem.name}
                    </p>
                  ))}
                  {selectedTable.orders[0].items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{selectedTable.orders[0].items.length - 3} ürün daha
                    </p>
                  )}
                  <p className="font-bold text-primary">
                    {formatCurrency(selectedTable.orders[0].totalAmount)}
                  </p>
                </div>
              )}

              {/* Quick Status Change */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Durum Değiştir
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"] as TableStatus[]
                  ).map((s) => (
                    <Button
                      key={s}
                      variant={selectedTable.status === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateStatus(selectedTable.id, s)}
                      className="text-xs h-8"
                    >
                      {statusConfig[s].label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Edit / Delete */}
              <div className="flex gap-2 pt-1 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5"
                  onClick={() => { setEditingTable(selectedTable); setShowTableModal(true); }}
                >
                  <Pencil className="w-3.5 h-3.5" />Düzenle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-1.5"
                  onClick={() => handleDelete(selectedTable.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />Sil
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-xl p-8 text-center text-muted-foreground bg-muted/30">
              <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Masa detayları için bir masa seçin</p>
            </div>
          )}
        </div>
      </div>

      {showTableModal && (
        <AddTableModal
          locationId={locationId}
          onClose={() => { setShowTableModal(false); setEditingTable(null); }}
          editTable={editingTable ?? undefined}
          onAdded={(table) => {
            setTables((prev) => [...prev, { ...table, orders: [] } as unknown as Table]);
            setShowTableModal(false);
          }}
          onEdited={(updated) => {
            setTables((prev) => prev.map((t) => t.id === updated.id ? { ...t, name: updated.name, capacity: updated.capacity, section: updated.section } : t));
            setSelectedTable((prev) => prev?.id === updated.id ? { ...prev, name: updated.name, capacity: updated.capacity, section: updated.section } : prev);
            setShowTableModal(false);
            setEditingTable(null);
          }}
        />
      )}
    </div>
  );
}
