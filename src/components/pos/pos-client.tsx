"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MenuPanel } from "./menu-panel";
import { CartPanel } from "./cart-panel";
import { TableSelector } from "./table-selector";
import { PaymentModal } from "./payment-modal";
import { usePOSStore } from "@/store/pos";
import { useIsMobile } from "@/hooks/use-mobile";
import { TableStatus } from "@prisma/client";
import { ShoppingCart, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  description?: string | null;
  preparationTime?: number | null;
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

interface Table {
  id: string;
  name: string;
  status: TableStatus;
  capacity: number;
  section?: string | null;
}

interface POSClientProps {
  categories: Category[];
  tables: Table[];
  organizationId: string;
  locationId?: string;
  staffId: string;
}

export function POSClient({ categories, tables, organizationId, locationId, staffId }: POSClientProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);
  const { selectedTableId, setTable, setActiveOrder, clearItems, cart, total, subtotal, discountAmount, orderType, notes, activeOrderId, activeOrderTotal } = usePOSStore();
  const isMobile = useIsMobile();
  const router = useRouter();

  function handlePaymentClose() {
    setShowPayment(false);
    router.refresh();
  }

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const tot = total();

  async function handleTableSelect(id: string) {
    setTable(id);
    const table = tables.find((t) => t.id === id);
    if (table?.status === "OCCUPIED") {
      try {
        const res = await fetch(`/api/orders?tableId=${id}&paymentStatus=UNPAID&limit=1`);
        const orders = await res.json();
        if (orders.length > 0) {
          setActiveOrder(orders[0].id, orders[0].totalAmount);
        } else {
          setActiveOrder(null, 0);
        }
      } catch {
        setActiveOrder(null, 0);
      }
    } else {
      setActiveOrder(null, 0);
    }
    setShowTableSelector(false);
  }

  function requireTable(): boolean {
    if (orderType === "DINE_IN" && !selectedTableId) {
      toast.error("Masa seçilmedi", { description: "Siparişi göndermeden önce masa seçin." });
      setShowTableSelector(true);
      return false;
    }
    return true;
  }

  async function handleSendOrder() {
    if (cart.length === 0) return;
    if (!requireTable()) return;
    setSendingOrder(true);
    try {
      const items = cart.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes,
        modifiers: item.modifiers,
      }));

      if (activeOrderId) {
        // Masada açık sipariş var — yeni ürünleri mevcut siparişe ekle
        const res = await fetch(`/api/orders/${activeOrderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        if (!res.ok) throw new Error();
        const order = await res.json();
        setActiveOrder(activeOrderId, order.totalAmount);
        clearItems();
        toast.success("Ürünler siparişe eklendi");
      } else {
        // Yeni sipariş oluştur
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locationId,
            organizationId,
            tableId: selectedTableId,
            staffId,
            type: orderType,
            notes,
            items,
            subtotal: subtotal(),
            discountAmount: discountAmount(),
            totalAmount: tot,
          }),
        });
        if (!res.ok) throw new Error();
        const order = await res.json();
        setActiveOrder(order.id, order.totalAmount);
        clearItems();
        toast.success("Sipariş mutfağa gönderildi");
      }
    } catch {
      toast.error("Sipariş gönderilemedi");
    } finally {
      setSendingOrder(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Menu Panel — full width on mobile, flex-1 on desktop */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MenuPanel
          categories={categories}
          onTableSelect={() => setShowTableSelector(true)}
          selectedTableId={selectedTableId}
          tables={tables}
        />
      </div>

      {/* Cart Panel — hidden on mobile (shown as drawer), fixed on desktop */}
      {!isMobile && (
        <div className="w-96 flex-shrink-0 border-l bg-background flex flex-col">
          <CartPanel
            onCheckout={() => { if (requireTable()) setShowPayment(true); }}
            onSendOrder={handleSendOrder}
            onTableSelect={() => setShowTableSelector(true)}
            tables={tables}
            sendingOrder={sendingOrder}
          />
        </div>
      )}

      {/* Mobile: Floating Cart Button */}
      {isMobile && itemCount > 0 && !showMobileCart && (
        <button
          onClick={() => setShowMobileCart(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-primary text-white rounded-full px-6 py-4 shadow-2xl active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{itemCount} ürün</span>
          <span className="font-bold">{formatCurrency(tot)}</span>
        </button>
      )}

      {/* Mobile: Cart Bottom Sheet */}
      {isMobile && showMobileCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="relative bg-background rounded-t-2xl flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">Sepet</span>
              <button
                onClick={() => setShowMobileCart(false)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CartPanel
                onCheckout={() => { setShowMobileCart(false); if (requireTable()) setShowPayment(true); }}
                onSendOrder={() => { handleSendOrder(); setShowMobileCart(false); }}
                onTableSelect={() => { setShowMobileCart(false); setShowTableSelector(true); }}
                tables={tables}
                sendingOrder={sendingOrder}
              />
            </div>
          </div>
        </div>
      )}

      {showTableSelector && (
        <TableSelector
          tables={tables}
          selectedId={selectedTableId}
          onSelect={handleTableSelect}
          onClose={() => setShowTableSelector(false)}
        />
      )}

      {showPayment && (
        <PaymentModal
          onClose={handlePaymentClose}
          organizationId={organizationId}
          locationId={locationId}
          staffId={staffId}
          activeOrderId={activeOrderId ?? undefined}
          activeOrderTotal={activeOrderTotal}
        />
      )}
    </div>
  );
}
