"use client";

import { useState } from "react";
import { MenuPanel } from "./menu-panel";
import { CartPanel } from "./cart-panel";
import { TableSelector } from "./table-selector";
import { PaymentModal } from "./payment-modal";
import { usePOSStore } from "@/store/pos";
import { TableStatus } from "@prisma/client";

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

export function POSClient({
  categories,
  tables,
  organizationId,
  locationId,
  staffId,
}: POSClientProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const { selectedTableId, setTable, orderType } = usePOSStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Menu Panel - left side */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MenuPanel
          categories={categories}
          onTableSelect={() => setShowTableSelector(true)}
          selectedTableId={selectedTableId}
          tables={tables}
        />
      </div>

      {/* Cart Panel - right side */}
      <div className="w-96 flex-shrink-0 border-l bg-background flex flex-col">
        <CartPanel
          onCheckout={() => setShowPayment(true)}
          onTableSelect={() => setShowTableSelector(true)}
          tables={tables}
        />
      </div>

      {showTableSelector && (
        <TableSelector
          tables={tables}
          selectedId={selectedTableId}
          onSelect={(id) => {
            setTable(id);
            setShowTableSelector(false);
          }}
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
