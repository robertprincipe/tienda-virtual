import { orderItems, orders, orderStatusEnum } from "@/drizzle/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const preprocessNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
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

const requiredNumber = (message: string, options?: { min?: number }) =>
  z.preprocess(
    preprocessNumber,
    z
      .number({
        error: message,
      })
      .min(options?.min ?? 0, message)
  );

const optionalNumber = (message?: string, options?: { min?: number }) =>
  z
    .preprocess(
      preprocessNumber,
      z
        .number({
          error: message ?? "Valor inválido",
        })
        .min(options?.min ?? 0, message ?? "Valor inválido")
    )
    .optional();

const optionalString = (max = 255) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined);

const orderInsertSchema = createInsertSchema(orders, {
  userId: z
    .preprocess(
      preprocessNumber,
      z.number().int("Selecciona un cliente válido").optional()
    )
    .optional(),
  email: z.string().email("Correo inválido").max(180),
  status: z.enum(orderStatusEnum.enumValues).default("created"),
  discount: optionalNumber("El descuento debe ser positivo", { min: 0 }).default(
    0
  ),
  tax: optionalNumber("El impuesto debe ser positivo", { min: 0 }).default(0),
  shipping: optionalNumber("El envío debe ser positivo", { min: 0 }).default(0),
  couponCode: optionalString(60),
  notes: optionalString(1000),
  fullName: z.string().min(1, "El nombre es obligatorio").max(150),
  line1: z.string().min(1, "La dirección es obligatoria").max(200),
  line2: optionalString(200),
  city: z.string().min(1, "La ciudad es obligatoria").max(100),
  region: optionalString(100),
  postalCode: optionalString(20),
  countryCode: z
    .string()
    .length(2, "Debe tener 2 caracteres")
    .transform((val) => val.toUpperCase()),
  phone: optionalString(32),
  shippingMethodName: optionalString(120),
  shippingCarrier: optionalString(60),
  shippingTrackingNumber: optionalString(120),
  shippedAt: z.preprocess(preprocessDate, z.date().optional()),
  deliveredAt: z.preprocess(preprocessDate, z.date().optional()),
  placedAt: z.preprocess(preprocessDate, z.date().optional()),
  canceledAt: z.preprocess(preprocessDate, z.date().optional()),
});

export const orderItemFormSchema = z.object({
  productId: requiredNumber("Selecciona un producto", { min: 1 }).pipe(
    z.number().int("Selecciona un producto válido")
  ),
  unitPrice: requiredNumber("Ingresa el precio", { min: 0 }),
  quantity: requiredNumber("Ingresa una cantidad", { min: 0.01 }),
});

export type OrderItemFormValues = z.infer<typeof orderItemFormSchema>;

export const orderFormSchema = orderInsertSchema
  .omit({
    subtotal: true,
    total: true,
    id: true,
    publicId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
  userId: orderInsertSchema.shape.userId,
  items: z.array(orderItemFormSchema).min(1, "Agrega al menos un producto"),
  });

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export type SelectOrder = typeof orders.$inferSelect;
export type SelectOrderItem = typeof orderItems.$inferSelect;

export type OrderItemWithProduct = SelectOrderItem & {
  quantity: number;
  unitPrice: number;
  product?: {
    id: number | null;
    name: string | null;
    sku: string | null;
    price: string | null;
  } | null;
};

export type OrderWithRelations = SelectOrder & {
  user?: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
  items: OrderItemWithProduct[];
};

export type OrderListItem = SelectOrder & {
  user?: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
  itemsCount: number;
};

export const paginatedOrdersSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(orderStatusEnum.enumValues).optional(),
  from: z
    .preprocess(preprocessDate, z.date().optional())
    .optional()
    .transform((value) => value || undefined),
  to: z
    .preprocess(preprocessDate, z.date().optional())
    .optional()
    .transform((value) => value || undefined),
});

export type GetPaginatedOrdersQueryProps = z.infer<typeof paginatedOrdersSchema>;
