"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TableStatus } from "@prisma/client";

interface Table {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
}

const statusConfig: Record<TableStatus, { label: string; color: string }> = {
  AVAILABLE: { label: "Boş", color: "bg-emerald-500" },
  OCCUPIED: { label: "Dolu", color: "bg-red-500" },
  RESERVED: { label: "Rezerve", color: "bg-amber-500" },
  CLEANING: { label: "Temizleniyor", color: "bg-blue-500" },
  INACTIVE: { label: "Pasif", color: "bg-gray-400" },
};

export function LiveTables({ tables }: { tables: Table[] }) {
  const counts = {
    available: tables.filter((t) => t.status === "AVAILABLE").length,
    occupied: tables.filter((t) => t.status === "OCCUPIED").length,
    reserved: tables.filter((t) => t.status === "RESERVED").length,
  };

  return (
    <Card className="border-0 shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Canlı Masa Durumu</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {counts.available} Boş
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            {counts.occupied} Dolu
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            {counts.reserved} Rezerve
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {tables.slice(0, 24).map((table) => {
            const cfg = statusConfig[table.status];
            return (
              <div
                key={table.id}
                className={cn(
                  "rounded-xl p-2 flex flex-col items-center gap-1 border",
                  table.status === "OCCUPIED"
                    ? "border-red-200 bg-red-50"
                    : table.status === "RESERVED"
                    ? "border-amber-200 bg-amber-50"
                    : table.status === "AVAILABLE"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <span className="text-[10px] font-semibold">{table.name}</span>
                <span
                  className={cn("w-2 h-2 rounded-full", cfg.color)}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
