import { cartItems, carts, cartsStatuses } from "@/drizzle/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const preprocessNumber = (value: unknown) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  return undefined;
};

const preprocessDate = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
};

const requiredNumber = (message: string) =>
  z.preprocess(
    preprocessNumber,
    z
      .number({
        error: message,
      })
      .int(message)
      .min(1, message)
  );

const optionalNumber = (message?: string) =>
  z
    .preprocess(
      preprocessNumber,
      z
        .number({
          error: message ?? "Valor inválido",
        })
        .int(message ?? "Valor inválido")
        .min(1, message ?? "Valor inválido")
    )
    .optional();

export const cartInsertSchema = createInsertSchema(carts, {
  userId: optionalNumber("Selecciona un usuario válido"),
  status: z
    .enum(cartsStatuses.enumValues)
    .default("active" as (typeof cartsStatuses.enumValues)[number]),
  expiresAt: z.preprocess(
    preprocessDate,
    z.date({ error: "Fecha inválida" }).optional()
  ),
});

export const selectCartSchema = createSelectSchema(carts);
export type InsertCart = z.infer<typeof cartInsertSchema>;
export type SelectCart = z.infer<typeof selectCartSchema>;

export const cartItemInsertSchema = createInsertSchema(cartItems, {
  cartId: requiredNumber("Selecciona un carrito"),
  productId: requiredNumber("Selecciona un producto"),
  quantity: z
    .preprocess(
      preprocessNumber,
      z
        .number({
          error: "Ingresa una cantidad válida",
        })
        .int("La cantidad debe ser entera")
        .min(1, "La cantidad debe ser mayor a cero")
    )
    .default(1),
});

export type InsertCartItem = z.infer<typeof cartItemInsertSchema>;

export const cartItemFormSchema = z.object({
  productId: requiredNumber("Selecciona un producto"),
  quantity: z
    .preprocess(
      preprocessNumber,
      z
        .number({
          error: "Ingresa una cantidad válida",
        })
        .int("La cantidad debe ser entera")
        .min(1, "La cantidad debe ser mayor a cero")
    )
    .default(1),
});

export type CartItemFormValues = z.infer<typeof cartItemFormSchema>;

export const cartFormSchema = cartInsertSchema.extend({
  items: z
    .array(cartItemFormSchema)
    .min(1, "Agrega al menos un producto al carrito"),
});

export type CartFormValues = z.infer<typeof cartFormSchema>;

export type CartItemWithProduct = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: string;
    stock: number | null;
    slug: string;
  } | null;
};

export type CartWithRelations = SelectCart & {
  user?: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
  items: CartItemWithProduct[];
};

export type CartListItem = SelectCart & {
  user?: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
  itemsCount: number;
  totalQuantity: number;
  totalValue: string;
};

export const paginatedCartsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(cartsStatuses.enumValues).optional(),
  userId: z.coerce.number().optional(),
});

export type GetPaginatedCartsQueryProps = z.infer<typeof paginatedCartsSchema>;
