"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePOSStore } from "@/store/pos";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, LayoutGrid, List, ShoppingCart } from "lucide-react";
import { TableStatus } from "@prisma/client";

interface Table {
  id: string;
  name: string;
  status: TableStatus;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  description?: string | null;
  modifierGroups: Array<{
    modifierGroup: {
      id: string;
      name: string;
      minSelect: number;
      maxSelect: number;
      isRequired: boolean;
      modifiers: Array<{ id: string; name: string; price: number; isDefault: boolean }>;
    };
  }>;
  variants: Array<{ id: string; name: string; price: number }>;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuPanelProps {
  categories: Category[];
  onTableSelect: () => void;
  selectedTableId: string | null;
  tables: Table[];
}

export function MenuPanel({
  categories,
  onTableSelect,
  selectedTableId,
  tables,
}: MenuPanelProps) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [gridView, setGridView] = useState(true);
  const { addItem, orderType, setOrderType } = usePOSStore();

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => (activeCat ? cat.id === activeCat : true))
    .filter((cat) => cat.items.length > 0);

  function handleAddItem(item: MenuItem) {
    addItem({
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity: 1,
      modifiers: [],
      image: item.image ?? undefined,
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* POS Top Bar */}
      <div className="h-16 border-b flex items-center justify-between px-4 gap-3 bg-background">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={orderType === "DINE_IN" ? "default" : "outline"}
            onClick={() => setOrderType("DINE_IN")}
            className="h-8 text-xs"
          >
            Masa
          </Button>
          <Button
            size="sm"
            variant={orderType === "TAKEOUT" ? "default" : "outline"}
            onClick={() => setOrderType("TAKEOUT")}
            className="h-8 text-xs"
          >
            Paket
          </Button>
          <Button
            size="sm"
            variant={orderType === "DELIVERY" ? "default" : "outline"}
            onClick={() => setOrderType("DELIVERY")}
            className="h-8 text-xs"
          >
            Kurye
          </Button>
        </div>

        {orderType === "DINE_IN" && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTableSelect}
            className="h-8 text-xs gap-2"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {selectedTable ? selectedTable.name : "Masa Seç"}
          </Button>
        )}

        <div className="relative flex-1 max-w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted border-0"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setGridView(!gridView)}
        >
          {gridView ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b scrollbar-hide">
        <button
          onClick={() => setActiveCat(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
            activeCat === null
              ? "bg-primary text-white"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          Tümü
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id === activeCat ? null : cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
              activeCat === cat.id
                ? "bg-primary text-white"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            {cat.name}
            <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
              {cat.items.length}
            </Badge>
          </button>
        ))}
      </div>

      {/* Items Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <p className="text-sm">Ürün bulunamadı</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.id} className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {cat.name}
              </h3>
              <div
                className={cn(
                  gridView
                    ? "grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3"
                    : "space-y-2"
                )}
              >
                {cat.items.map((item) =>
                  gridView ? (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="group rounded-xl border bg-card hover:border-primary hover:shadow-md transition-all text-left p-3 space-y-2 active:scale-95"
                    >
                      {item.image ? (
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      className="w-full flex items-center justify-between rounded-xl border bg-card hover:border-primary hover:shadow-sm transition-all px-4 py-3 active:scale-[0.99]"
                    >
                      <div className="text-left">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary flex-shrink-0 ml-3">
                        {formatCurrency(item.price)}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
