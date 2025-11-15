import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "@pheralb/toast";
import { CartItem } from "@/types/cart";

type CartStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  items: CartItem[];
  total: () => number;
  amount: () => number;
  add: (item: CartItem) => void;
  remove: (id: number) => void;
  empty: () => void;
};

const initialState = {
  items: [] as CartItem[],
};

export const useCartStore = create(
  persist<CartStore>(
    (set, get) => ({
      ...initialState,
      add: async (item: CartItem) => {
        try {
          const { items } = get();
          if (items.some((item) => item.id)) {
            set({ items: [...items, item] });
          } else {
            set({
              items: items.map((item) =>
                item.id === item.id
                  ? { ...item, count: item.quantity + 1 }
                  : item
              ),
            });
          }
        } catch (error) {
          toast.error({
            text: "Error al agregar el producto al carrito",
          });
          set({ ...initialState });
        }
      },
      remove: (id: number) => {
        const { items } = get();

        set({
          items: items
            .map((item) =>
              item.id === id ? { ...item, count: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity),
        });
      },
      empty: () => {
        set({ ...initialState });
      },
      amount: () => {
        const { items } = get();
        return items.reduce((acc, item) => acc + item.quantity * 1, 0);
      },
      total: () => {
        const { items } = get();
        return items.reduce((acc, item) => acc + item.quantity, 0);
      },
      open: false,
      setOpen: (open: boolean) => {
        set({ open });
      },
    }),

    {
      name: "cart",
    }
  )
);
