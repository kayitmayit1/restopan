"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ShoppingCart, Search, Minus, Plus, ChefHat, X,
  Loader2, CheckCircle2, UtensilsCrossed, Bike,
  Phone, MapPin, User, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { isValidTurkishPhone, PHONE_ERROR } from "@/lib/phone";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Props {
  organization: { id: string; name: string; logo?: string | null; currency: string };
  categories: Array<{
    id: string; name: string;
    items: Array<{ id: string; name: string; description?: string | null; price: number; image?: string | null }>;
  }>;
  locationId?: string;
  deliveryMinOrder?: number;
  deliveryFee?: number;
  deliveryZone?: string;
}

export function DeliveryMenuClient({ organization, categories, locationId, deliveryMinOrder, deliveryFee = 0, deliveryZone }: Props) {
  const [step, setStep] = useState<"info" | "menu">("info");
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [noteTarget, setNoteTarget] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;
  const belowMinimum = deliveryMinOrder != null && subtotal < deliveryMinOrder;

  function proceedToMenu() {
    if (!deliveryName.trim()) { toast.error("Ad Soyad gerekli"); return; }
    if (!deliveryPhone.trim()) { toast.error("Telefon numarası gerekli"); return; }
    if (!isValidTurkishPhone(deliveryPhone)) { toast.error(PHONE_ERROR); return; }
    if (!deliveryAddress.trim()) { toast.error("Teslimat adresi gerekli"); return; }
    setStep("menu");
  }

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
    if (cart.length === 0) { toast.error("Sepet boş"); return; }
    if (belowMinimum) {
      toast.error(`Minimum sipariş tutarı ${formatCurrency(deliveryMinOrder!)}`);
      return;
    }
    setOrdering(true);
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          locationId,
          type: "DELIVERY",
          deliveryName,
          deliveryPhone,
          deliveryAddress,
          deliveryFee,
          notes: notes || undefined,
          items: cart.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            unitPrice: i.price,
            notes: i.notes,
          })),
          subtotal,
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

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    }))
    .filter((cat) => (activeCat ? cat.id === activeCat : true) && cat.items.length > 0);

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
          <div className="bg-orange-50 rounded-2xl p-4 text-left space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Bike className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span className="font-semibold text-orange-700">Teslimat Bilgileri</span>
            </div>
            <p className="text-sm text-gray-700">{deliveryName} · {deliveryPhone}</p>
            <p className="text-sm text-gray-600">{deliveryAddress}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Siparişiniz hazırlanıyor. Kurye en kısa sürede yola çıkacak.</p>
          <p className="text-xs text-muted-foreground mb-8">Ödeme kapıda nakit yapılır.</p>
          <Button onClick={() => { setOrderNumber(null); setStep("info"); setDeliveryName(""); setDeliveryPhone(""); setDeliveryAddress(""); }} variant="outline">
            Yeni Sipariş Ver
          </Button>
        </div>
      </div>
    );
  }

  if (step === "info") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold">{organization.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">Kurye siparişi</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />Ad Soyad
              </label>
              <Input
                placeholder="Adınız ve soyadınız"
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />Telefon
              </label>
              <Input
                placeholder="05XX XXX XX XX"
                type="tel"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />Teslimat Adresi
              </label>
              <Input
                placeholder="Mahalle, sokak, bina no, daire"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Delivery info summary */}
          {(deliveryMinOrder != null || deliveryFee != null || deliveryZone) && (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
              {deliveryZone && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{deliveryZone}</span>
                </div>
              )}
              {deliveryMinOrder != null && deliveryMinOrder > 0 && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="w-4 h-4 flex items-center justify-center text-primary font-bold flex-shrink-0">₺</span>
                  <span>Minimum sipariş: <strong>{formatCurrency(deliveryMinOrder)}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Bike className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Teslimat ücreti: <strong>{deliveryFee && deliveryFee > 0 ? formatCurrency(deliveryFee) : "Ücretsiz"}</strong></span>
              </div>
            </div>
          )}

          <Button className="w-full h-12 rounded-2xl gap-2" onClick={proceedToMenu}>
            Menüyü Görüntüle
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-center text-muted-foreground">Ödeme kapıda nakit yapılır</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base truncate">{organization.name}</p>
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <Bike className="w-3 h-3" />
                <span className="truncate">{deliveryAddress}</span>
              </div>
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

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

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

        {filtered.map((cat) => (
          <div key={cat.id}>
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {cat.name}
            </h2>
            <div className="space-y-2.5">
              {cat.items.map((item) => {
                const inCart = cart.find((c) => c.menuItemId === item.id);
                return (
                  <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] leading-snug">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                      )}
                      <p className="text-primary font-bold mt-1.5">{formatCurrency(item.price)}</p>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-primary/8 rounded-xl p-1 flex-shrink-0">
                        <button onClick={() => updateQty(item.id, inCart.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{inCart.quantity}</span>
                        <button onClick={() => updateQty(item.id, inCart.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addItem(item)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white flex-shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
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
      </div>

      {itemCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="max-w-2xl mx-auto space-y-2">
            {belowMinimum && (
              <p className="text-xs text-center text-amber-700 bg-amber-50 rounded-lg py-1.5 px-3">
                Minimum sipariş tutarı {formatCurrency(deliveryMinOrder!)} · {formatCurrency(deliveryMinOrder! - subtotal)} daha ekleyin
              </p>
            )}
            <button onClick={() => setShowCart(true)} className={`w-full text-white py-3.5 rounded-2xl font-semibold flex items-center justify-between px-5 ${belowMinimum ? "bg-amber-500" : "bg-primary"}`}>
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>
              <span>Sepeti Görüntüle</span>
              <span className="font-bold">{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-2xl mx-auto max-h-[90vh] flex flex-col">
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
                      <button onClick={() => updateQty(item.menuItemId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.menuItemId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {noteTarget === item.menuItemId ? (
                    <Input autoFocus placeholder="Not ekle" value={item.notes ?? ""} onChange={(e) => setItemNote(item.menuItemId, e.target.value)} onBlur={() => setNoteTarget(null)} className="text-xs h-8" />
                  ) : (
                    <button onClick={() => setNoteTarget(item.menuItemId)} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                      {item.notes ? `📝 ${item.notes}` : "+ Not ekle"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-5 border-t space-y-3">
              <div className="bg-orange-50 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
                  <Bike className="w-3.5 h-3.5" />Teslimat
                </div>
                <p className="text-xs text-gray-700">{deliveryName} · {deliveryPhone}</p>
                <p className="text-xs text-gray-600">{deliveryAddress}</p>
              </div>
              <Input
                placeholder="Sipariş notu (isteğe bağlı)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs h-8"
              />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Ara Toplam</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Teslimat Ücreti</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                {deliveryFee === 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Teslimat Ücreti</span>
                    <span className="font-medium">Ücretsiz</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Toplam</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
              {belowMinimum && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  Minimum sipariş tutarı {formatCurrency(deliveryMinOrder!)}. Devam etmek için {formatCurrency(deliveryMinOrder! - subtotal)} daha ekleyin.
                </div>
              )}
              <Button className="w-full h-12 text-base rounded-2xl" onClick={placeOrder} disabled={ordering || belowMinimum}>
                {ordering && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {ordering ? "Gönderiliyor…" : "Siparişi Onayla"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">Ödeme kapıda nakit yapılır</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
