"use server";

import { db } from "@/drizzle/db";
import { carts, cartItems, products } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

const CART_COOKIE_NAME = "cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export interface CartItemWithProduct {
  id: number;
  cartId: number;
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

export interface CartData {
  id: number;
  userId: number | null;
  status: string;
  items: CartItemWithProduct[];
}

/**
 * Crear un nuevo carrito
 */
export async function createCart(userId?: number): Promise<number> {
  const [cart] = await db
    .insert(carts)
    .values({
      userId: userId || null,
      status: "active",
    })
    .returning({ id: carts.id });

  // Si es carrito anónimo, guardar en cookie
  if (!userId) {
    const cookieStore = await cookies();
    cookieStore.set(CART_COOKIE_NAME, cart.id.toString(), {
      maxAge: CART_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return cart.id;
}

/**
 * Obtener ID del carrito actual (desde cookie o usuario)
 */
export async function getCartId(): Promise<number | null> {
  const session = await getSession();
  const cookieStore = await cookies();

  // Si usuario autenticado, buscar su carrito activo
  if (session?.user?.id) {
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.status, "active")),
      columns: { id: true },
    });

    return userCart?.id || null;
  }

  // Si no autenticado, buscar en cookie
  const cartIdCookie = cookieStore.get(CART_COOKIE_NAME);
  return cartIdCookie ? parseInt(cartIdCookie.value) : null;
}

/**
 * Cargar el carrito actual con sus items
 */
export async function loadCart(): Promise<CartData | null> {
  const cartId = await getCartId();

  if (!cartId) {
    return null;
  }

  const cart = await db.query.carts.findFirst({
    where: eq(carts.id, cartId),
    with: {
      items: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              price: true,
              compareAtPrice: true,
              slug: true,
              stock: true,
            },
            extras: {
              primaryImage: sql<string | null>`(
                select product_images.image_url
                from product_images
                where product_images.product_id = ${products.id}
                order by product_images.sort_order asc
                limit 1
              )`.as("primaryImage"),
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return null;
  }

  return {
    id: cart.id,
    userId: cart.userId,
    status: cart.status,
    items: cart.items.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        compareAtPrice: item.product.compareAtPrice,
        primaryImage: item.product.primaryImage,
        slug: item.product.slug,
        stock: item.product.stock,
      },
    })),
  };
}

/**
 * Agregar item al carrito
 */
export async function addItemToCart(
  productId: number,
  quantity: number = 1
): Promise<{ success: boolean; message: string; cartId?: number }> {
  try {
    // Validar stock del producto
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true, stock: true, status: true },
    });

    if (!product) {
      return { success: false, message: "Producto no encontrado" };
    }

    if (product.status !== "active") {
      return { success: false, message: "Producto no disponible" };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        message: `Stock insuficiente. Solo quedan ${product.stock} unidades`,
      };
    }

    // Obtener o crear carrito
    let cartId = await getCartId();

    if (!cartId) {
      const session = await getSession();
      cartId = await createCart(session?.user?.id);
    }

    // Verificar si el producto ya existe en el carrito
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cartId),
        eq(cartItems.productId, productId)
      ),
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return {
          success: false,
          message: `Stock insuficiente. Solo quedan ${product.stock} unidades`,
        };
      }

      await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      await db.insert(cartItems).values({
        cartId,
        productId,
        quantity,
      });
    }

    return {
      success: true,
      message: "Producto agregado al carrito",
      cartId,
    };
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return { success: false, message: "Error al agregar producto al carrito" };
  }
}

/**
 * Actualizar cantidad de un item en el carrito
 */
export async function updateCartItem(
  productId: number,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    const cartId = await getCartId();

    if (!cartId) {
      return { success: false, message: "Carrito no encontrado" };
    }

    // Si quantity es 0, eliminar el item
    if (quantity === 0) {
      await db
        .delete(cartItems)
        .where(
          and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
        );

      return { success: true, message: "Producto eliminado del carrito" };
    }

    // Validar stock
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { stock: true },
    });

    if (!product || product.stock < quantity) {
      return {
        success: false,
        message: `Stock insuficiente. Solo quedan ${
          product?.stock || 0
        } unidades`,
      };
    }

    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      );

    return { success: true, message: "Cantidad actualizada" };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, message: "Error al actualizar cantidad" };
  }
}

/**
 * Eliminar item del carrito
 */
export async function removeCartItem(
  productId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const cartId = await getCartId();

    if (!cartId) {
      return { success: false, message: "Carrito no encontrado" };
    }

    await db
      .delete(cartItems)
      .where(
        and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId))
      );

    return { success: true, message: "Producto eliminado del carrito" };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return { success: false, message: "Error al eliminar producto" };
  }
}

/**
 * Limpiar carrito
 */
export async function clearCart(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const cartId = await getCartId();

    if (!cartId) {
      return { success: false, message: "Carrito no encontrado" };
    }

    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    return { success: true, message: "Carrito limpiado" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, message: "Error al limpiar carrito" };
  }
}

/**
 * Migrar carrito anónimo a usuario autenticado
 */
export async function migrateAnonymousCart(
  shouldMerge: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    const cookieStore = await cookies();

    if (!session?.user?.id) {
      return { success: false, message: "Usuario no autenticado" };
    }

    const cartIdCookie = cookieStore.get(CART_COOKIE_NAME);
    if (!cartIdCookie) {
      return { success: false, message: "No hay carrito anónimo" };
    }

    const anonymousCartId = parseInt(cartIdCookie.value);

    // Obtener carrito anónimo
    const anonymousCart = await db.query.carts.findFirst({
      where: eq(carts.id, anonymousCartId),
      with: {
        items: true,
      },
    });

    if (!anonymousCart || anonymousCart.items.length === 0) {
      // Limpiar cookie
      cookieStore.delete(CART_COOKIE_NAME);
      return { success: true, message: "Carrito anónimo vacío" };
    }

    // Obtener o crear carrito del usuario
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.status, "active")),
      with: {
        items: true,
      },
    });

    if (!userCart) {
      // Asignar el carrito anónimo al usuario
      await db
        .update(carts)
        .set({ userId: session.user.id })
        .where(eq(carts.id, anonymousCartId));

      cookieStore.delete(CART_COOKIE_NAME);
      return { success: true, message: "Carrito migrado exitosamente" };
    }

    if (shouldMerge) {
      // Migrar items del carrito anónimo al carrito del usuario
      for (const item of anonymousCart.items) {
        const existingItem = userCart.items.find(
          (i) => i.productId === item.productId
        );

        if (existingItem) {
          // Sumar cantidades
          await db
            .update(cartItems)
            .set({ quantity: existingItem.quantity + item.quantity })
            .where(eq(cartItems.id, existingItem.id));
        } else {
          // Agregar nuevo item
          await db.insert(cartItems).values({
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
          });
        }
      }
    }

    // Eliminar carrito anónimo
    await db.delete(cartItems).where(eq(cartItems.cartId, anonymousCartId));
    await db.delete(carts).where(eq(carts.id, anonymousCartId));

    // Limpiar cookie
    cookieStore.delete(CART_COOKIE_NAME);

    return {
      success: true,
      message: shouldMerge
        ? "Carritos fusionados exitosamente"
        : "Carrito de usuario mantenido",
    };
  } catch (error) {
    console.error("Error migrating anonymous cart:", error);
    return { success: false, message: "Error al migrar carrito" };
  }
}

/**
 * Verificar si hay carrito anónimo pendiente de migración
 */
export async function checkPendingCartMigration(): Promise<{
  hasPendingMigration: boolean;
  anonymousItemsCount: number;
  userItemsCount: number;
}> {
  try {
    const session = await getSession();
    const cookieStore = await cookies();

    if (!session?.user?.id) {
      return {
        hasPendingMigration: false,
        anonymousItemsCount: 0,
        userItemsCount: 0,
      };
    }

    const cartIdCookie = cookieStore.get(CART_COOKIE_NAME);
    if (!cartIdCookie) {
      return {
        hasPendingMigration: false,
        anonymousItemsCount: 0,
        userItemsCount: 0,
      };
    }

    const anonymousCartId = parseInt(cartIdCookie.value);

    // Contar items en carrito anónimo
    const anonymousCart = await db.query.carts.findFirst({
      where: eq(carts.id, anonymousCartId),
      with: {
        items: true,
      },
    });

    if (!anonymousCart || anonymousCart.items.length === 0) {
      return {
        hasPendingMigration: false,
        anonymousItemsCount: 0,
        userItemsCount: 0,
      };
    }

    // Contar items en carrito del usuario
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, session.user.id), eq(carts.status, "active")),
      with: {
        items: true,
      },
    });

    return {
      hasPendingMigration: true,
      anonymousItemsCount: anonymousCart.items.length,
      userItemsCount: userCart?.items.length || 0,
    };
  } catch (error) {
    console.error("Error checking pending cart migration:", error);
    return {
      hasPendingMigration: false,
      anonymousItemsCount: 0,
      userItemsCount: 0,
    };
  }
}
