import { coupons, couponsTypes } from "@/drizzle/schema";
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

const requiredNumber = (message: string, options?: { min?: number }) =>
  z.preprocess(
    preprocessNumber,
    z
      .number({
        invalid_type_error: message,
        required_error: message,
      })
      .min(options?.min ?? 0, message)
  );

const optionalNumber = (message: string, options?: { min?: number }) =>
  z
    .preprocess(
      preprocessNumber,
      z
        .number({
          invalid_type_error: message,
        })
        .min(options?.min ?? 0, message)
    )
    .optional();

const optionalInteger = (message: string, options?: { min?: number }) =>
  z
    .preprocess(
      preprocessNumber,
      z
        .number({
          invalid_type_error: message,
        })
        .int(message)
        .min(options?.min ?? 0, message)
    )
    .optional();

const optionalDate = z
  .preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }

      return new Date(trimmed);
    }

  return value;
}, z.date({ invalid_type_error: "Fecha inválida", required_error: "Fecha inválida" }))
  .optional();

const optionalBoolean = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .optional()
  .transform((value) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  });

export const couponInsertSchema = createInsertSchema(coupons, {
  code: z
    .string({
      error: "El código es obligatorio",
    })
    .trim()
    .min(1, "El código es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  type: z.enum(couponsTypes.enumValues),
  value: requiredNumber("El valor es obligatorio", { min: 0.01 }),
  minSubtotal: optionalNumber("El subtotal debe ser mayor o igual a 0", {
    min: 0,
  }),
  maxUses: optionalInteger("Ingresa un número válido", { min: 1 }),
  maxUsesPerUser: optionalInteger("Ingresa un número válido", { min: 1 }),
  startsAt: optionalDate,
  endsAt: optionalDate,
  isActive: z
    .preprocess((value) => {
      if (typeof value === "string") {
        if (value === "true") return true;
        if (value === "false") return false;
      }
      return value;
    }, z.boolean())
    .default(true),
});

export const selectCouponSchema = createSelectSchema(coupons);

export type InsertCoupon = z.infer<typeof couponInsertSchema>;
export type SelectCoupon = z.infer<typeof selectCouponSchema>;

export const couponFormSchema = couponInsertSchema.extend({
  productIds: z
    .array(
      z
        .number({
          error: "Selecciona un producto válido",
        })
        .int("Selecciona un producto válido")
        .min(1, "Selecciona un producto válido")
    )
    .optional(),
  categoryIds: z
    .array(
      z
        .number({
          error: "Selecciona una categoría válida",
        })
        .int("Selecciona una categoría válida")
        .min(1, "Selecciona una categoría válida")
    )
    .optional(),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;

export type CouponListItem = SelectCoupon & {
  productsCount?: number;
  categoriesCount?: number;
};

export type CouponWithRelations = SelectCoupon & {
  products: Array<{
    id: number;
    name: string;
    sku: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
  }>;
};

export const couponFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(couponsTypes.enumValues).optional(),
  is_active: optionalBoolean,
  is_valid: optionalBoolean,
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
});

export type CouponFiltersInput = z.infer<typeof couponFiltersSchema>;

export const paginatedCouponsSchema = couponFiltersSchema.extend({
  page: z.coerce.number().min(1).default(1),
  per_page: z.coerce.number().min(1).max(50).default(10),
});

export type GetPaginatedCouponsQueryProps = z.infer<
  typeof paginatedCouponsSchema
>;
