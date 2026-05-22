"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import Image from "next/image";
import {
  Wifi, Clock, Flame, ChevronUp, Plus, Minus, X,
  ShoppingCart, ChevronRight, CheckCircle2, Loader2,
} from "lucide-react";

interface Variant {
  id: string;
  name: string;
  price: number;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  calories: number | null;
  preparationTime: number | null;
  allergens: string[];
  isFeatured: boolean;
  variants: Variant[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  items: Item[];
}

interface Org {
  name: string;
  logo: string | null;
  currency: string;
  dailySpecial: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
}

interface CartItem {
  menuItemId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  price: number;
  quantity: number;
}

interface Props {
  org: Org;
  categories: Category[];
  tableName: string | null;
  tableId: string | null;
  orgId: string;
  locationId: string | null;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

function cartKey(menuItemId: string, variantId: string | null) {
  return `${menuItemId}:${variantId ?? ""}`;
}

export function MenuUI({ org, categories, tableName, tableId, orgId, locationId }: Props) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsRef = useRef<HTMLDivElement>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [variantPickerItem, setVariantPickerItem] = useState<Item | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  // Checkout form
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEOUT">(tableId ? "DINE_IN" : "TAKEOUT");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      let current = categories[0]?.id ?? "";
      for (const cat of categories) {
        const el = categoryRefs.current[cat.id];
        if (el && el.getBoundingClientRect().top <= 100) current = cat.id;
      }
      setActiveCategory(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories]);

  function scrollToCategory(id: string) {
    const el = categoryRefs.current[id];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveCategory(id);
    const tab = tabsRef.current?.querySelector(`[data-cat="${id}"]`) as HTMLElement | null;
    tab?.scrollIntoView({ inline: "center", behavior: "smooth" });
  }

  const addToCart = useCallback((menuItemId: string, variantId: string | null, name: string, variantName: string | null, price: number) => {
    setCart((prev) => {
      const key = cartKey(menuItemId, variantId);
      const existing = prev.find((i) => cartKey(i.menuItemId, i.variantId) === key);
      if (existing) {
        return prev.map((i) => cartKey(i.menuItemId, i.variantId) === key ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId, variantId, name, variantName, price, quantity: 1 }];
    });
  }, []);

  const decrementCart = useCallback((menuItemId: string, variantId: string | null) => {
    setCart((prev) => {
      const key = cartKey(menuItemId, variantId);
      const existing = prev.find((i) => cartKey(i.menuItemId, i.variantId) === key);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((i) => cartKey(i.menuItemId, i.variantId) !== key);
      return prev.map((i) => cartKey(i.menuItemId, i.variantId) === key ? { ...i, quantity: i.quantity - 1 } : i);
    });
  }, []);

  function getItemQty(menuItemId: string, variantId: string | null = null) {
    return cart.find((i) => cartKey(i.menuItemId, i.variantId) === cartKey(menuItemId, variantId))?.quantity ?? 0;
  }

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const hasCart = cartCount > 0;

  async function submitOrder() {
    if (submitting || !locationId) return;
    if (orderType === "TAKEOUT" && !customerName.trim()) {
      setSubmitError("Adınızı girmeniz gerekiyor.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          locationId,
          tableId: orderType === "DINE_IN" ? tableId : null,
          type: orderType,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          notes: orderNotes.trim() || undefined,
          items: cart.map((i) => ({
            menuItemId: i.menuItemId,
            variantId: i.variantId ?? undefined,
            quantity: i.quantity,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error ?? "Bir hata oluştu.");
        return;
      }
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      setSuccessOrder(json.orderNumber);
    } catch {
      setSubmitError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  const hasSocial = org.instagramUrl || org.facebookUrl || org.twitterUrl;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {org.logo && (
            <Image src={org.logo} alt={org.name} width={32} height={32} className="rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{org.name}</p>
            {tableName && <p className="text-xs text-muted-foreground">{tableName}</p>}
          </div>
        </div>
      </header>

      {/* Daily Special Banner */}
      {org.dailySpecial && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-start gap-2">
            <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">{org.dailySpecial}</p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="bg-white border-b sticky top-14 z-10">
          <div ref={tabsRef} className="max-w-2xl mx-auto flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-cat={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-8">
        {categories.map((cat) => (
          <section key={cat.id} ref={(el) => { categoryRefs.current[cat.id] = el; }}>
            <div className="mb-3">
              <h2 className="text-base font-bold">{cat.name}</h2>
              {cat.description && <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>}
              {(cat.availableFrom || cat.availableTo) && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {cat.availableFrom} – {cat.availableTo}
                </p>
              )}
            </div>
            <div className="space-y-2">
              {cat.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currency={org.currency}
                  getQty={getItemQty}
                  onAdd={
                    item.variants.length > 0
                      ? () => setVariantPickerItem(item)
                      : () => addToCart(item.id, null, item.name, null, item.price)
                  }
                  onDecrement={
                    item.variants.length > 0
                      ? () => setVariantPickerItem(item)
                      : () => decrementCart(item.id, null)
                  }
                />
              ))}
            </div>
          </section>
        ))}

        {/* Wi-Fi */}
        {(org.wifiName || org.wifiPassword) && (
          <div className="bg-white rounded-2xl border p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Wi-Fi</p>
              {org.wifiName && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">Ağ:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded select-all">{org.wifiName}</span>
                </div>
              )}
              {org.wifiPassword && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground w-12">Şifre:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded select-all">{org.wifiPassword}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social */}
        {hasSocial && (
          <div className="flex items-center justify-center gap-4 py-2">
            {org.instagramUrl && (
              <a href={org.instagramUrl} target="_blank" rel="noopener noreferrer" className="px-4 h-10 bg-white border rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-semibold text-pink-500">
                Instagram
              </a>
            )}
            {org.facebookUrl && (
              <a href={org.facebookUrl} target="_blank" rel="noopener noreferrer" className="px-4 h-10 bg-white border rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-semibold text-blue-600">
                Facebook
              </a>
            )}
            {org.twitterUrl && (
              <a href={org.twitterUrl} target="_blank" rel="noopener noreferrer" className="px-4 h-10 bg-white border rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700">
                𝕏
              </a>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground pb-2">restoPAN ile hazırlandı</p>
      </main>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed right-4 z-30 w-10 h-10 bg-white border shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-all ${hasCart ? "bottom-20" : "bottom-6"}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Cart Bar */}
      {hasCart && !cartOpen && !checkoutOpen && !successOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-primary text-white rounded-2xl h-14 flex items-center px-4 shadow-lg active:scale-[0.98] transition-transform"
            >
              <span className="bg-white/25 rounded-lg w-7 h-7 flex items-center justify-center text-sm font-bold shrink-0">
                {cartCount}
              </span>
              <span className="flex-1 text-center font-semibold">Sepeti Gör</span>
              <span className="font-bold shrink-0">{formatPrice(cartTotal, org.currency)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Variant Picker */}
      {variantPickerItem && (
        <Overlay onClose={() => setVariantPickerItem(null)}>
          <div className="bg-white rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">{variantPickerItem.name}</h3>
              <button onClick={() => setVariantPickerItem(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {variantPickerItem.variants.map((v) => {
                const qty = getItemQty(variantPickerItem.id, v.id);
                return (
                  <div key={v.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{v.name}</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(v.price, org.currency)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <>
                          <button onClick={() => decrementCart(variantPickerItem.id, v.id)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold">{qty}</span>
                        </>
                      )}
                      <button onClick={() => addToCart(variantPickerItem.id, v.id, variantPickerItem.name, v.name, v.price)} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {cart.some((i) => i.menuItemId === variantPickerItem.id) && (
              <button onClick={() => setVariantPickerItem(null)} className="w-full mt-4 bg-primary text-white rounded-xl h-11 font-semibold text-sm">
                Tamam
              </button>
            )}
          </div>
        </Overlay>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <Overlay onClose={() => setCartOpen(false)}>
          <div className="bg-white rounded-t-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Sepetim
              </h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div key={cartKey(item.menuItemId, item.variantId)} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                    <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity, org.currency)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => decrementCart(item.menuItemId, item.variantId)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => addToCart(item.menuItemId, item.variantId, item.name, item.variantName, item.price)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Toplam</span>
                <span className="font-bold text-base">{formatPrice(cartTotal, org.currency)}</span>
              </div>
              <button
                onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                className="w-full bg-primary text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2"
              >
                Sipariş Ver <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Checkout Sheet */}
      {checkoutOpen && (
        <Overlay onClose={() => { setCheckoutOpen(false); setCartOpen(true); }}>
          <div className="bg-white rounded-t-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-base">Sipariş Bilgileri</h3>
              <button onClick={() => { setCheckoutOpen(false); setCartOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Order type */}
              <div>
                <p className="text-sm font-semibold mb-2">Teslimat Türü</p>
                <div className={`grid gap-2 ${tableId ? "grid-cols-2" : "grid-cols-1"}`}>
                  {tableId && (
                    <button
                      onClick={() => setOrderType("DINE_IN")}
                      className={`rounded-xl border-2 p-3 text-sm font-medium text-center transition-colors ${
                        orderType === "DINE_IN" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      🍽️ Masaya Getir
                      {tableName && <span className="block text-xs mt-0.5 opacity-70">{tableName}</span>}
                    </button>
                  )}
                  <button
                    onClick={() => setOrderType("TAKEOUT")}
                    className={`rounded-xl border-2 p-3 text-sm font-medium text-center transition-colors ${
                      orderType === "TAKEOUT" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-600"
                    }`}
                  >
                    🥡 Paket Sipariş
                  </button>
                </div>
              </div>

              {/* Customer info (required for takeout) */}
              {orderType === "TAKEOUT" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">
                      Adınız <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full border rounded-xl px-3 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full border rounded-xl px-3 h-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium block mb-1">Not (isteğe bağlı)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Özel istek veya not..."
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                {cart.map((item) => (
                  <div key={cartKey(item.menuItemId, item.variantId)} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}× {item.name}{item.variantName ? ` (${item.variantName})` : ""}
                    </span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity, org.currency)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t mt-1">
                  <span>Toplam</span>
                  <span>{formatPrice(cartTotal, org.currency)}</span>
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{submitError}</p>
              )}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={submitOrder}
                disabled={submitting || !locationId}
                className="w-full bg-primary text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                ) : (
                  "Siparişi Onayla"
                )}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Success Screen */}
      {successOrder && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Siparişiniz Alındı!</h2>
          <p className="text-muted-foreground text-sm mb-1">Sipariş numaranız</p>
          <p className="text-3xl font-black tracking-wider text-primary mb-4">{successOrder}</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-xs">
            {orderType === "DINE_IN"
              ? "Siparişiniz hazırlanıp masanıza getirilecek."
              : "Siparişiniz hazırlandığında teslim alabilirsiniz."}
          </p>
          <button
            onClick={() => setSuccessOrder(null)}
            className="px-8 h-11 bg-primary text-white rounded-xl font-semibold text-sm"
          >
            Menüye Dön
          </button>
        </div>
      )}
    </div>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full mx-auto">{children}</div>
    </div>
  );
}

function MenuItemCard({
  item,
  currency,
  getQty,
  onAdd,
  onDecrement,
}: {
  item: Item;
  currency: string;
  getQty: (menuItemId: string, variantId: string | null) => number;
  onAdd: () => void;
  onDecrement: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasVariants = item.variants.length > 0;

  const totalQty = hasVariants
    ? item.variants.reduce((s, v) => s + getQty(item.id, v.id), 0)
    : getQty(item.id, null);

  const minPrice = hasVariants ? Math.min(...item.variants.map((v) => v.price)) : null;
  const canExpand = !!(item.description || item.allergens.length > 0 || item.variants.length > 0);

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${item.isFeatured ? "border-amber-200" : ""}`}>
      <div
        className={`flex gap-3 p-3 ${canExpand ? "cursor-pointer" : ""}`}
        onClick={() => canExpand && setExpanded((v) => !v)}
      >
        {item.image && (
          <Image src={item.image} alt={item.name} width={72} height={72} className="rounded-lg object-cover shrink-0 w-[72px] h-[72px]" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug flex items-center gap-1.5 flex-wrap">
                {item.isFeatured && <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                {item.name}
              </p>
              {item.description && !expanded && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-primary">
                {minPrice !== null ? `${formatPrice(minPrice, currency)}'den` : formatPrice(item.price, currency)}
              </p>
              {(item.calories || item.preparationTime) && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {item.calories ? `${item.calories} kcal` : ""}
                  {item.calories && item.preparationTime ? " · " : ""}
                  {item.preparationTime ? `${item.preparationTime} dk` : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Add / Qty controls */}
        <div className="shrink-0 flex items-center self-center" onClick={(e) => e.stopPropagation()}>
          {!hasVariants && totalQty > 0 ? (
            <div className="flex items-center gap-1.5">
              <button onClick={onDecrement} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center active:scale-95">
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold w-4 text-center">{totalQty}</span>
              <button onClick={onAdd} className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center active:scale-95">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={onAdd}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {hasVariants && totalQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalQty}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t pt-2">
          {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
          {item.variants.length > 0 && (
            <div className="space-y-1">
              {item.variants.map((v) => (
                <div key={v.id} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{v.name}</span>
                  <span className="font-semibold">{formatPrice(v.price, currency)}</span>
                </div>
              ))}
            </div>
          )}
          {item.allergens.length > 0 && (
            <p className="text-[10px] text-muted-foreground">Alerjenler: {item.allergens.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
