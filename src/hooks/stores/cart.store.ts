import { create } from "zustand";
import { toast } from "@pheralb/toast";
import {
  loadCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartAction,
} from "@/services/cart/actions/cart.actions";

export interface CartStoreItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: string;
    compareAtPrice: string | null;
    primaryImage: string | null;
    slug: string;
    stock: number;
  };
}

interface CartStore {
  // Estado
  open: boolean;
  items: CartStoreItem[];
  cartId: number | null;
  loading: boolean;

  // Métodos de UI
  setOpen: (open: boolean) => void;
  setCartId: (cartId: number | null) => void;

  // Métodos de carrito
  loadCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // Cálculos
  total: () => number;
  amount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  // Estado inicial
  open: false,
  items: [],
  cartId: null,
  loading: false,

  // Setters de UI
  setOpen: (open: boolean) => set({ open }),
  setCartId: (cartId: number | null) => set({ cartId }),

  // Cargar carrito desde la DB
  loadCart: async () => {
    try {
      set({ loading: true });
      const cart = await loadCart();

      if (cart) {
        set({
          cartId: cart.id,
          items: cart.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            product: item.product,
          })),
        });
      } else {
        set({ cartId: null, items: [] });
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast.error({
        text: "Error al cargar el carrito",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Sincronizar carrito (recargar desde DB)
  syncCart: async () => {
    await get().loadCart();
  },

  // Agregar item al carrito
  addItem: async (productId: number, quantity: number = 1) => {
    try {
      set({ loading: true });

      const result = await addItemToCart(productId, quantity);

      if (result.success) {
        // Actualizar estado local
        await get().syncCart();

        // Abrir el CartSheet
        set({ open: true });

        toast.success({
          text: result.message,
        });

        return true;
      } else {
        toast.error({
          text: result.message,
        });
        return false;
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error({
        text: "Error al agregar el producto al carrito",
      });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Actualizar cantidad de un item
  updateQuantity: async (productId: number, quantity: number) => {
    try {
      set({ loading: true });

      // Actualización optimista
      const currentItems = get().items;
      const itemIndex = currentItems.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex !== -1) {
        const newItems = [...currentItems];

        if (quantity === 0) {
          // Eliminar item si cantidad es 0
          newItems.splice(itemIndex, 1);
        } else {
          // Actualizar cantidad
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            quantity,
          };
        }

        set({ items: newItems });
      }

      // Sincronizar con DB
      const result = await updateCartItem(productId, quantity);

      if (result.success) {
        // Recargar desde DB para asegurar consistencia
        await get().syncCart();
      } else {
        // Revertir cambio optimista
        await get().syncCart();
        toast.error({
          text: result.message,
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      await get().syncCart();
      toast.error({
        text: "Error al actualizar la cantidad",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Eliminar item del carrito
  removeItem: async (productId: number) => {
    try {
      set({ loading: true });

      // Actualización optimista
      const currentItems = get().items;
      set({
        items: currentItems.filter((item) => item.productId !== productId),
      });

      const result = await removeCartItem(productId);

      if (result.success) {
        toast.success({
          text: result.message,
        });
      } else {
        // Revertir cambio optimista
        await get().syncCart();
        toast.error({
          text: result.message,
        });
      }
    } catch (error) {
      console.error("Error removing item:", error);
      await get().syncCart();
      toast.error({
        text: "Error al eliminar el producto",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Limpiar carrito
  clearCart: async () => {
    try {
      set({ loading: true });

      const result = await clearCartAction();

      if (result.success) {
        set({ items: [] });
        toast.success({
          text: result.message,
        });
      } else {
        toast.error({
          text: result.message,
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error({
        text: "Error al limpiar el carrito",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Calcular total de items
  total: () => {
    const { items } = get();
    return items.reduce((acc, item) => acc + item.quantity, 0);
  },

  // Calcular monto total
  amount: () => {
    const { items } = get();
    return items.reduce((acc, item) => {
      const price = parseFloat(item.product.price || "0");
      return acc + price * item.quantity;
    }, 0);
  },
}));
