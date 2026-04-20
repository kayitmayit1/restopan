"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

export function LowStockAlert({ items }: { items: LowStockItem[] }) {
  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-600">
          <AlertTriangle className="w-4 h-4" />
          Düşük Stok Uyarısı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="truncate">{item.name}</span>
            <span className="text-amber-600 font-medium flex-shrink-0 ml-2">
              {item.quantity} {item.unit}
            </span>
          </div>
        ))}
        <Link
          href="/dashboard/envanter"
          className="text-xs text-primary hover:underline block pt-1"
        >
          Envanteri görüntüle →
        </Link>
      </CardContent>
    </Card>
  );
}
