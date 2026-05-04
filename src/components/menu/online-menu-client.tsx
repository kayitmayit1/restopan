"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ShoppingCart, Search, Minus, Plus, ChefHat, X,
  Loader2, CheckCircle2, UtensilsCrossed, BellRing,
  Banknote, CreditCard, Wifi, ExternalLink, Megaphone,
} from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Props {
  organization: {
    id: string; name: string; logo?: string | null; currency: string;
    plan?: string;
    dailySpecial?: string | null; dailySpecialActive?: boolean;
    wifiName?: string | null; wifiPassword?: string | null;
    instagramUrl?: string | null; facebookUrl?: string | null; twitterUrl?: string | null;
  };
  categories: Array<{
    id: string; name: string;
    items: Array<{ id: string; name: string; description?: string | null; price: number; image?: string | null }>;
  }>;
  locationId?: string;
  tableId?: string;
  tableName?: string;
}

export function OnlineMenuClient({ organization, categories, locationId, tableId, tableName }: Props) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [noteTarget, setNoteTarget] = useState<string | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [requestingWaiter, setRequestingWaiter] = useState(false);

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function addItem(item: { id: string; name: string; price: number }) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) return prev.map((c) => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function updateQty(id: string, qty: number) {
    setCart((prev) => qty <= 0
      ? prev.filter((c) => c.menuItemId !== id)
      : prev.map((c) => c.menuItemId === id ? { ...c, quantity: qty } : c)
    );
  }

  function setItemNote(id: string, note: string) {
    setCart((prev) => prev.map((c) => c.menuItemId === id ? { ...c, notes: note } : c));
  }

  async function placeOrder() {
    if (!locationId) { toast.error("Şube bilgisi eksik"); return; }
    setOrdering(true);
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          locationId,
          tableId: tableId ?? null,
          items: cart.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            unitPrice: i.price,
            notes: i.notes,
          })),
          subtotal: total,
          totalAmount: total,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrderNumber(data.orderNumber);
      setCart([]);
      setShowCart(false);
    } catch {
      toast.error("Sipariş gönderilemedi, tekrar deneyin");
    } finally {
      setOrdering(false);
    }
  }

  async function callWaiter() {
    setRequestingWaiter(true);
    try {
      await fetch("/api/public/table-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id, tableId, tableName, type: "WAITER" }),
      });
      toast.success("Garson çağrıldı!");
    } catch {
      toast.error("İstek gönderilemedi");
    } finally {
      setRequestingWaiter(false);
    }
  }

  async function requestBill(paymentMethod: "CASH" | "CARD") {
    setShowBillModal(false);
    try {
      await fetch("/api/public/table-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: organization.id, tableId, tableName, type: "BILL", paymentMethod }),
      });
      toast.success("Hesap isteği iletildi!");
    } catch {
      toast.error("İstek gönderilemedi");
    }
  }

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    }))
    .filter((cat) => (activeCat ? cat.id === activeCat : true) && cat.items.length > 0);

  const hasTableRequests = organization.plan === "PROFESSIONAL" || organization.plan === "ENTERPRISE";
  const hasSocial = organization.instagramUrl || organization.facebookUrl || organization.twitterUrl;
  const hasWifi = organization.wifiName;
  const hasFooter = hasSocial || hasWifi;

  // Order success screen
  if (orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Siparişiniz Alındı!</h1>
          <p className="text-muted-foreground mb-1">Sipariş No</p>
          <p className="text-3xl font-bold text-primary mb-4">{orderNumber}</p>
          {tableName && (
            <p className="text-sm text-muted-foreground mb-6">
              <UtensilsCrossed className="w-3.5 h-3.5 inline mr-1" />
              {tableName}
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-8">
            Siparişiniz mutfağa iletildi. Hazır olduğunda servis edilecek.
          </p>
          <Button onClick={() => setOrderNumber(null)} variant="outline">
            Yeni Sipariş Ver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base truncate">{organization.name}</p>
              {tableName && <p className="text-xs text-muted-foreground">{tableName}</p>}
            </div>
          </div>
          {itemCount > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-2 bg-primary text-white px-3.5 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount}
              <span className="hidden sm:inline">· {formatCurrency(total)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Special Banner */}
      {organization.dailySpecialActive && organization.dailySpecial && (
        <div className="bg-amber-500 text-white">
          <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-2.5 text-sm font-medium">
            <Megaphone className="w-4 h-4 flex-shrink-0" />
            <span>{organization.dailySpecial}</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Waiter call buttons (only when at table AND plan supports it) */}
        {tableId && hasTableRequests && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={callWaiter}
              disabled={requestingWaiter}
              className="flex items-center justify-center gap-2 bg-white border rounded-xl py-3 text-sm font-semibold shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              {requestingWaiter
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <BellRing className="w-4 h-4" />
              }
              Garson Çağır
            </button>
            <button
              onClick={() => setShowBillModal(true)}
              className="flex items-center justify-center gap-2 bg-white border rounded-xl py-3 text-sm font-semibold shadow-sm hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors"
            >
              <Banknote className="w-4 h-4" />
              Hesap İste
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setActiveCat(null)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors",
              !activeCat ? "bg-primary text-white" : "bg-white border text-muted-foreground"
            )}
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id === activeCat ? null : cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors",
                activeCat === cat.id ? "bg-primary text-white" : "bg-white border text-muted-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu items */}
        {filtered.map((cat) => (
          <div key={cat.id}>
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {cat.name}
            </h2>
            <div className="space-y-2.5">
              {cat.items.map((item) => {
                const inCart = cart.find((c) => c.menuItemId === item.id);
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {item.image && (
                      <div className="relative w-full h-36">
                        <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[15px] leading-snug">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <p className="text-primary font-bold mt-1.5">{formatCurrency(item.price)}</p>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-1.5 bg-primary/8 rounded-xl p-1 flex-shrink-0">
                          <button
                            onClick={() => updateQty(item.id, inCart.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center tabular-nums">{inCart.quantity}</span>
                          <button
                            onClick={() => updateQty(item.id, inCart.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(item)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ürün bulunamadı</p>
          </div>
        )}

        {/* Wi-Fi & Social Footer */}
        {hasFooter && (
          <div className="mt-6 rounded-2xl bg-white shadow-sm p-4 space-y-3">
            {hasWifi && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Wifi className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wi-Fi</p>
                  <p className="text-sm font-semibold">{organization.wifiName}</p>
                  {organization.wifiPassword && (
                    <p className="text-xs text-muted-foreground font-mono">{organization.wifiPassword}</p>
                  )}
                </div>
              </div>
            )}
            {hasSocial && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <p className="text-xs text-muted-foreground">Takip Et</p>
                {organization.instagramUrl && (
                  <a href={organization.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 text-xs font-semibold hover:bg-pink-100 transition-colors">
                    Instagram <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {organization.facebookUrl && (
                  <a href={organization.facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors">
                    Facebook <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {organization.twitterUrl && (
                  <a href={organization.twitterUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors">
                    X (Twitter) <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky bottom cart button */}
      {itemCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-primary text-white py-3.5 rounded-2xl font-semibold flex items-center justify-between px-5"
            >
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
              <span>Sepeti Görüntüle</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-2xl mx-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-lg">Sepetim</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y">
              {cart.map((item) => (
                <div key={item.menuItemId} className="px-5 py-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-primary font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1 flex-shrink-0">
                      <button onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {noteTarget === item.menuItemId ? (
                    <Input
                      autoFocus
                      placeholder="Not ekle (isteğe bağlı)"
                      value={item.notes ?? ""}
                      onChange={(e) => setItemNote(item.menuItemId, e.target.value)}
                      onBlur={() => setNoteTarget(null)}
                      className="text-xs h-8"
                    />
                  ) : (
                    <button
                      onClick={() => setNoteTarget(item.menuItemId)}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.notes ? `📝 ${item.notes}` : "+ Not ekle"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 border-t space-y-3">
              {tableName && (
                <p className="text-xs text-muted-foreground text-center">
                  <UtensilsCrossed className="w-3 h-3 inline mr-1" />
                  {tableName}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Toplam</span>
                <span className="font-bold text-xl text-primary">{formatCurrency(total)}</span>
              </div>
              <Button className="w-full h-12 text-base rounded-2xl" onClick={placeOrder} disabled={ordering}>
                {ordering && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {ordering ? "Gönderiliyor…" : "Siparişi Onayla"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Ödeme masada yapılır
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bill payment modal */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-lg text-center">Ödeme Şekli</h3>
            <p className="text-sm text-muted-foreground text-center">Hesabınızı nasıl ödemek istersiniz?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => requestBill("CASH")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Banknote className="w-7 h-7 text-emerald-600" />
                <span className="font-semibold text-emerald-700">Nakit</span>
              </button>
              <button
                onClick={() => requestBill("CARD")}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <CreditCard className="w-7 h-7 text-blue-600" />
                <span className="font-semibold text-blue-700">Kart</span>
              </button>
            </div>
            <button
              onClick={() => setShowBillModal(false)}
              className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
