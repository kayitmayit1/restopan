"use client";

import { cn } from "@/lib/utils";
import { TableStatus } from "@prisma/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Table {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
  section?: string | null;
}

interface TableSelectorProps {
  tables: Table[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const statusConfig: Record<TableStatus, { label: string; bg: string; text: string }> = {
  AVAILABLE: { label: "Boş", bg: "bg-emerald-50 border-emerald-200 hover:border-emerald-400", text: "text-emerald-700" },
  OCCUPIED: { label: "Dolu", bg: "bg-red-50 border-red-200 hover:border-red-400", text: "text-red-700" },
  RESERVED: { label: "Rezerve", bg: "bg-amber-50 border-amber-200 hover:border-amber-400", text: "text-amber-700" },
  CLEANING: { label: "Temizleniyor", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  INACTIVE: { label: "Pasif", bg: "bg-gray-50 border-gray-200", text: "text-gray-500" },
};

export function TableSelector({
  tables,
  selectedId,
  onSelect,
  onClose,
}: TableSelectorProps) {
  const sections = Array.from(new Set(tables.map((t) => t.section || "Genel")));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Masa Seç</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-5 space-y-6">
          {sections.map((section) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {section}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {tables
                  .filter((t) => (t.section || "Genel") === section)
                  .map((table) => {
                    const cfg = statusConfig[table.status];
                    const isSelected = table.id === selectedId;
                    return (
                      <button
                        key={table.id}
                        onClick={() => onSelect(table.id)}
                        disabled={table.status === "INACTIVE"}
                        className={cn(
                          "rounded-xl border-2 p-3 transition-all text-center space-y-1",
                          cfg.bg,
                          isSelected && "ring-2 ring-primary ring-offset-2",
                          table.status === "INACTIVE" && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <p className="font-bold text-sm">{table.name}</p>
                        <p className={cn("text-[10px] font-medium", cfg.text)}>
                          {cfg.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {table.capacity} kişi
                        </p>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
