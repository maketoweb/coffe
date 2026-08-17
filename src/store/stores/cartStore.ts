import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  itemId: string;
  quantity: number;
}

interface CartState {
  quickCart: CartItem[];
  addToQuickCart: (itemId: string, qty?: number) => void;
  removeFromQuickCart: (itemId: string) => void;
  clearQuickCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      quickCart: [],
      addToQuickCart: (itemId, qty = 1) =>
        set((state) => {
          const existing = state.quickCart.find((c) => c.itemId === itemId);
          if (existing) {
            return {
              quickCart: state.quickCart.map((c) =>
                c.itemId === itemId ? { ...c, quantity: c.quantity + qty } : c
              ),
            };
          }
          return { quickCart: [...state.quickCart, { itemId, quantity: qty }] };
        }),
      removeFromQuickCart: (itemId) =>
        set((state) => ({
          quickCart: state.quickCart.filter((c) => c.itemId !== itemId),
        })),
      clearQuickCart: () => set({ quickCart: [] }),
    }),
    { name: 'marketcoffee-quick-cart' }
  )
);
