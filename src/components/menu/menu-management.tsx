"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  GripVertical,
  Eye,
  EyeOff,
  Tag,
  Package,
  LayoutTemplate,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { CategoryModal } from "./category-modal";
import { ItemModal } from "./item-modal";
import { TemplateModal } from "./template-modal";
import { useRouter } from "next/navigation";

interface MenuItemVariant {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  cost?: number | null;
  image?: string | null;
  isActive: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  allergens: string[];
  variants: MenuItemVariant[];
}

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  items: MenuItem[];
}

interface MenuManagementProps {
  categories: Category[];
  organizationId: string;
}

export function MenuManagement({
  categories: initialCategories,
  organizationId,
}: MenuManagementProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ catId: string; itemId: string; name: string } | null>(null);

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const activeItems = categories.reduce(
    (s, c) => s + c.items.filter((i) => i.isActive).length,
    0
  );

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => (activeCat ? cat.id === activeCat : true));

  async function toggleItemAvailability(
    catId: string,
    itemId: string,
    isAvailable: boolean
  ) {
    try {
      await fetch(`/api/menu/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? {
                ...c,
                items: c.items.map((i) =>
                  i.id === itemId ? { ...i, isAvailable } : i
                ),
              }
            : c
        )
      );
    } catch {
      toast.error("Güncelleme başarısız");
    }
  }

  async function deleteItem(catId: string, itemId: string) {
    try {
      await fetch(`/api/menu/items/${itemId}`, { method: "DELETE" });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
            : c
        )
      );
      toast.success("Ürün silindi");
    } catch {
      toast.error("Silme başarısız");
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-xs text-muted-foreground">Kategori</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-xs text-muted-foreground">Toplam Ürün</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <p className="text-xs text-muted-foreground">Aktif Ürün</p>
          <p className="text-2xl font-bold text-emerald-600">{activeItems}</p>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateModal(true)}
          >
            <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
            Şablon
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditCategory(null);
              setShowCategoryModal(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Kategori
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditItem(null);
              setSelectedCategoryId(activeCat || categories[0]?.id || null);
              setShowItemModal(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Ürün Ekle
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutTemplate className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-muted-foreground">Henüz menü oluşturulmadı</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-6">
            Hazır şablon ile hızlıca başlayın veya manuel oluşturun
          </p>
          <Button onClick={() => setShowTemplateModal(true)}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Hazır Şablon Seç
          </Button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCat(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
            activeCat === null
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Tümü ({totalItems})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id === activeCat ? null : cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 flex items-center gap-1.5",
              activeCat === cat.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat.name}
            <span className="opacity-70">({cat.items.length})</span>
            <DropdownMenu>
              <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="hover:opacity-70 inline-flex items-center">
                <MoreVertical className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditCategory(cat);
                    setShowCategoryModal(true);
                  }}
                >
                  <Edit className="w-3.5 h-3.5 mr-2" />
                  Düzenle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        {filteredCategories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-sm">{cat.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {cat.items.length} ürün
              </Badge>
              {!cat.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Pasif
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs h-7"
                onClick={() => {
                  setEditItem(null);
                  setSelectedCategoryId(cat.id);
                  setShowItemModal(true);
                }}
              >
                <Plus className="w-3 h-3 mr-1" />
                Ürün Ekle
              </Button>
            </div>

            <div className="rounded-xl border overflow-hidden">
              {cat.items.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <Package className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  Bu kategoride ürün yok
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                        Ürün
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden md:table-cell">
                        Fiyat
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs hidden lg:table-cell">
                        Maliyet
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">
                        Durum
                      </th>
                      <th className="px-4 py-2.5 w-16" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cat.items.map((item) => (
                      <tr
                        key={item.id}
                        className={cn(
                          "hover:bg-muted/30 transition-colors",
                          !item.isActive && "opacity-50"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 cursor-grab hidden sm:block" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.name}</p>
                                {item.isFeatured && (
                                  <Badge className="text-[10px] h-4 px-1 bg-amber-500">
                                    <Tag className="w-2.5 h-2.5 mr-0.5" />
                                    Öne Çıkan
                                  </Badge>
                                )}
                              </div>
                              {item.variants.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {item.variants.length} varyant
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="font-semibold text-primary">
                            {formatCurrency(item.price)}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {item.cost ? (
                            <div>
                              <span className="text-muted-foreground">
                                {formatCurrency(item.cost)}
                              </span>
                              <span className="text-xs text-emerald-600 ml-2">
                                %{(((item.price - item.cost) / item.price) * 100).toFixed(0)} kar
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              toggleItemAvailability(
                                cat.id,
                                item.id,
                                !item.isAvailable
                              )
                            }
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors",
                              item.isAvailable
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            )}
                          >
                            {item.isAvailable ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {item.isAvailable ? "Mevcut" : "Tükendi"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-accent">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditItem(item);
                                  setSelectedCategoryId(cat.id);
                                  setShowItemModal(true);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setConfirmDelete({ catId: cat.id, itemId: item.id, name: item.name })}
                                className="text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTemplateModal && (
        <TemplateModal
          organizationId={organizationId}
          onClose={() => setShowTemplateModal(false)}
          onImported={() => {
            setShowTemplateModal(false);
            router.refresh();
          }}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          organizationId={organizationId}
          category={editCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditCategory(null);
          }}
          onSaved={(cat) => {
            if (editCategory) {
              setCategories((prev) =>
                prev.map((c) => (c.id === cat.id ? { ...c, ...cat } : c))
              );
            } else {
              setCategories((prev) => [...prev, { ...cat, items: [] }]);
            }
            setShowCategoryModal(false);
          }}
        />
      )}

      {showItemModal && selectedCategoryId && (
        <ItemModal
          organizationId={organizationId}
          categoryId={selectedCategoryId}
          categories={categories}
          item={editItem}
          onClose={() => {
            setShowItemModal(false);
            setEditItem(null);
          }}
          onSaved={(item, catId) => {
            if (editItem) {
              setCategories((prev) =>
                prev.map((c) =>
                  c.id === catId
                    ? { ...c, items: c.items.map((i) => (i.id === item.id ? item : i)) }
                    : c
                )
              );
            } else {
              setCategories((prev) =>
                prev.map((c) =>
                  c.id === catId ? { ...c, items: [...c.items, item] } : c
                )
              );
            }
            setShowItemModal(false);
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Ürünü Sil</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>{confirmDelete.name}</strong> ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>İptal</Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={async () => {
                  await deleteItem(confirmDelete.catId, confirmDelete.itemId);
                  setConfirmDelete(null);
                }}
              >
                Sil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
