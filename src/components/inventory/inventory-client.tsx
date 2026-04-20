"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  MoreVertical,
  Edit,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { AddItemModal } from "./add-item-modal";
import { AdjustStockModal } from "./adjust-stock-modal";

interface InventoryCategory { id: string; name: string }
interface Supplier { id: string; name: string }
interface InventoryItem {
  id: string;
  name: string;
  sku?: string | null;
  unit: string;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number | null;
  costPerUnit: number;
  isActive: boolean;
  category?: InventoryCategory | null;
  supplier?: Supplier | null;
}
interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  createdAt: Date;
  notes?: string | null;
  inventoryItem: { name: string; unit: string };
}

interface InventoryClientProps {
  items: InventoryItem[];
  categories: InventoryCategory[];
  movements: StockMovement[];
  locationId: string;
  organizationId: string;
}

const moveTypeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PURCHASE: { label: "Satın Alım", color: "text-emerald-600", icon: TrendingUp },
  SALE: { label: "Satış", color: "text-blue-600", icon: TrendingDown },
  WASTE: { label: "Fire", color: "text-red-600", icon: TrendingDown },
  ADJUSTMENT: { label: "Düzeltme", color: "text-amber-600", icon: ArrowUpDown },
  TRANSFER: { label: "Transfer", color: "text-purple-600", icon: ArrowUpDown },
  RETURN: { label: "İade", color: "text-orange-600", icon: TrendingUp },
};

export function InventoryClient({
  items: initialItems,
  categories,
  movements: initialMovements,
  locationId,
  organizationId,
}: InventoryClientProps) {
  const [items, setItems] = useState(initialItems);
  const [movements, setMovements] = useState(initialMovements);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const lowStock = items.filter((i) => i.quantity <= i.minQuantity);
  const totalValue = items.reduce((s, i) => s + i.quantity * i.costPerUnit, 0);

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter ? item.category?.id === catFilter : true;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Toplam Ürün</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Düşük Stok</p>
            <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Toplam Stok Değeri</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Kategori</p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items">
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="items">Stok Listesi</TabsTrigger>
            <TabsTrigger value="movements">Hareketler</TabsTrigger>
            {lowStock.length > 0 && (
              <TabsTrigger value="alerts" className="text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Uyarılar ({lowStock.length})
              </TabsTrigger>
            )}
          </TabsList>
          <Button size="sm" onClick={() => { setEditItem(null); setShowAdd(true); }}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Malzeme Ekle
          </Button>
        </div>

        <TabsContent value="items" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Malzeme ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              <button
                onClick={() => setCatFilter(null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                  !catFilter ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}
              >
                Tümü
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCatFilter(c.id === catFilter ? null : c.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
                    catFilter === c.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Malzeme", "Kategori", "Stok", "Min. Stok", "Birim Maliyet", "Toplam Değer", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      Malzeme bulunamadı
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isLow = item.quantity <= item.minQuantity;
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {item.category ? (
                            <Badge variant="secondary" className="text-xs">{item.category.name}</Badge>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("font-bold", isLow ? "text-amber-600" : "text-foreground")}>
                            {item.quantity}
                          </span>
                          <span className="text-muted-foreground ml-1 text-xs">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.minQuantity} {item.unit}
                        </td>
                        <td className="px-4 py-3">{formatCurrency(item.costPerUnit)}</td>
                        <td className="px-4 py-3 font-semibold">
                          {formatCurrency(item.quantity * item.costPerUnit)}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setAdjustItem(item)}>
                                <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
                                Stok Güncelle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setEditItem(item); setShowAdd(true); }}>
                                <Edit className="w-3.5 h-3.5 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Tarih", "Malzeme", "İşlem", "Miktar", "Not"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {movements.map((m) => {
                  const cfg = moveTypeConfig[m.type] || { label: m.type, color: "", icon: Package };
                  const Icon = cfg.icon;
                  const isPositive = ["PURCHASE", "RETURN", "ADJUSTMENT"].includes(m.type) && m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3 font-medium">{m.inventoryItem.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn("flex items-center gap-1.5 text-xs font-medium", cfg.color)}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={isPositive ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                          {isPositive ? "+" : "-"}{Math.abs(m.quantity)} {m.inventoryItem.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{m.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="space-y-3">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between border rounded-xl p-4 bg-amber-50 border-amber-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-amber-700">
                      Mevcut: <b>{item.quantity} {item.unit}</b> · Minimum: {item.minQuantity} {item.unit}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setAdjustItem(item)}>
                  Stok Ekle
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showAdd && (
        <AddItemModal
          locationId={locationId}
          organizationId={organizationId}
          categories={categories}
          item={editItem}
          onClose={() => { setShowAdd(false); setEditItem(null); }}
          onSaved={(item) => {
            if (editItem) {
              setItems((prev) => prev.map((i) => i.id === item.id ? item : i));
            } else {
              setItems((prev) => [...prev, item]);
            }
            setShowAdd(false);
          }}
        />
      )}

      {adjustItem && (
        <AdjustStockModal
          item={adjustItem}
          locationId={locationId}
          onClose={() => setAdjustItem(null)}
          onSaved={(updatedItem, movement) => {
            setItems((prev) => prev.map((i) => i.id === updatedItem.id ? updatedItem : i));
            setMovements((prev) => [movement, ...prev]);
            setAdjustItem(null);
          }}
        />
      )}
    </div>
  );
}
