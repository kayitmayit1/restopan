"use client";

import { useState } from "react";
import { MenuPanel } from "./menu-panel";
import { CartPanel } from "./cart-panel";
import { TableSelector } from "./table-selector";
import { PaymentModal } from "./payment-modal";
import { usePOSStore } from "@/store/pos";
import { useIsMobile } from "@/hooks/use-mobile";
import { TableStatus } from "@prisma/client";
import { ShoppingCart, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
  const { selectedTableId, setTable, cart, total } = usePOSStore();
  const isMobile = useIsMobile();

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const tot = total();

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
            onCheckout={() => setShowPayment(true)}
            onTableSelect={() => setShowTableSelector(true)}
            tables={tables}
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
                onCheckout={() => { setShowMobileCart(false); setShowPayment(true); }}
                onTableSelect={() => { setShowMobileCart(false); setShowTableSelector(true); }}
                tables={tables}
              />
            </div>
          </div>
        </div>
      )}

      {showTableSelector && (
        <TableSelector
          tables={tables}
          selectedId={selectedTableId}
          onSelect={(id) => { setTable(id); setShowTableSelector(false); }}
          onClose={() => setShowTableSelector(false)}
        />
      )}

      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          organizationId={organizationId}
          locationId={locationId}
          staffId={staffId}
        />
      )}
    </div>
  );
}
