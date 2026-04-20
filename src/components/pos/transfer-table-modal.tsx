"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { TableStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Table {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
  section?: string | null;
}

interface TransferTableModalProps {
  orderId: string;
  currentTableId: string;
  tables: Table[];
  onClose: () => void;
  onSuccess: (toTableId: string) => void;
}

export function TransferTableModal({
  orderId,
  currentTableId,
  tables,
  onClose,
  onSuccess,
}: TransferTableModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const availableTables = tables.filter(
    (t) => t.id !== currentTableId && t.status === "AVAILABLE"
  );

  async function handleTransfer() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/transfer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toTableId: selected }),
      });
      if (!res.ok) throw new Error();
      const toTable = tables.find((t) => t.id === selected);
      toast.success(`Sipariş ${toTable?.name} masasına aktarıldı`);
      onSuccess(selected);
    } catch {
      toast.error("Aktarım başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold">Masa Aktar</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Siparişi taşımak istediğiniz boş masayı seçin.
          </p>

          {availableTables.length === 0 ? (
            <p className="text-sm text-center py-6 text-muted-foreground">Uygun boş masa yok</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {availableTables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                    selected === t.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span>{t.name}</span>
                  <Badge variant="outline" className="text-[10px]">{t.capacity} kişi</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">İptal</Button>
          <Button
            onClick={handleTransfer}
            disabled={!selected || loading}
            className="flex-1"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            Aktar
          </Button>
        </div>
      </div>
    </div>
  );
}
