import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartModifier {
  modifierId: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  modifiers: CartModifier[];
  notes?: string;
  variantId?: string;
  variantName?: string;
}

interface POSState {
  cart: CartItem[];
  selectedTableId: string | null;
  selectedCustomerId: string | null;
  orderType: "DINE_IN" | "TAKEOUT" | "DELIVERY";
  discount: number;
  discountType: "PERCENTAGE" | "FIXED";
  notes: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  activeOrderId: string | null;
  activeOrderTotal: number;

  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  setTable: (id: string | null) => void;
  setCustomer: (id: string | null) => void;
  setOrderType: (type: POSState["orderType"]) => void;
  setDiscount: (amount: number, type: POSState["discountType"]) => void;
  setNotes: (notes: string) => void;
  setDeliveryInfo: (name: string, phone: string, address: string) => void;
  setActiveOrder: (id: string | null, total?: number) => void;
  clearItems: () => void;
  clearCart: () => void;

  subtotal: () => number;
  discountAmount: () => number;
  total: () => number;
}

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      cart: [],
      selectedTableId: null,
      selectedCustomerId: null,
      orderType: "DINE_IN",
      discount: 0,
      discountType: "PERCENTAGE",
      notes: "",
      deliveryName: "",
      deliveryPhone: "",
      deliveryAddress: "",
      activeOrderId: null,
      activeOrderTotal: 0,

      addItem: (item) => {
        const { cart } = get();
        const existingIdx = cart.findIndex(
          (c) =>
            c.menuItemId === item.menuItemId &&
            c.variantId === item.variantId &&
            JSON.stringify(c.modifiers) === JSON.stringify(item.modifiers)
        );

        if (existingIdx >= 0) {
          const updated = [...cart];
          updated[existingIdx].quantity += item.quantity;
          set({ cart: updated });
        } else {
          set({
            cart: [...cart, { ...item, id: crypto.randomUUID() }],
          });
        }
      },

      removeItem: (id) =>
        set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((s) => ({
          cart:
            quantity <= 0
              ? s.cart.filter((c) => c.id !== id)
              : s.cart.map((c) => (c.id === id ? { ...c, quantity } : c)),
        })),

      updateNotes: (id, notes) =>
        set((s) => ({
          cart: s.cart.map((c) => (c.id === id ? { ...c, notes } : c)),
        })),

      setTable: (id) => set({ selectedTableId: id }),
      setCustomer: (id) => set({ selectedCustomerId: id }),
      setOrderType: (type) => set({ orderType: type }),
      setDiscount: (amount, type) => set({ discount: amount, discountType: type }),
      setNotes: (notes) => set({ notes }),
      setDeliveryInfo: (name, phone, address) => set({ deliveryName: name, deliveryPhone: phone, deliveryAddress: address }),
      setActiveOrder: (id, total = 0) => set({ activeOrderId: id, activeOrderTotal: total }),
      clearItems: () => set({ cart: [], discount: 0, notes: "" }),
      clearCart: () =>
        set({
          cart: [],
          selectedTableId: null,
          selectedCustomerId: null,
          discount: 0,
          notes: "",
          deliveryName: "",
          deliveryPhone: "",
          deliveryAddress: "",
          activeOrderId: null,
          activeOrderTotal: 0,
        }),

      subtotal: () => {
        const { cart } = get();
        return cart.reduce((sum, item) => {
          const modTotal = item.modifiers.reduce((ms, m) => ms + m.price, 0);
          return sum + (item.unitPrice + modTotal) * item.quantity;
        }, 0);
      },

      discountAmount: () => {
        const { discount, discountType } = get();
        const sub = get().subtotal();
        if (discountType === "PERCENTAGE") return (sub * discount) / 100;
        return Math.min(discount, sub);
      },

      total: () => {
        return get().subtotal() - get().discountAmount();
      },
    }),
    {
      name: "pos-cart",
      partialize: (s) => ({
        cart: s.cart,
        selectedTableId: s.selectedTableId,
        selectedCustomerId: s.selectedCustomerId,
        orderType: s.orderType,
        discount: s.discount,
        discountType: s.discountType,
        notes: s.notes,
        deliveryName: s.deliveryName,
        deliveryPhone: s.deliveryPhone,
        deliveryAddress: s.deliveryAddress,
      }),
    }
  )
);
