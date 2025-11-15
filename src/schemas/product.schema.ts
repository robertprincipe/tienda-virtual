import { productImages, products, productStatuses } from "@/drizzle/schema";
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
        .min(options?.min ?? 0, message)
    )
    .optional();

const optionalString = (max = 255) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined);

export const productInsertSchema = createInsertSchema(products, {
  name: z
    .string({
      error: "El nombre es obligatorio",
    })
    .min(1, "El nombre es obligatorio"),
  slug: optionalString(230),
  sku: z
    .string({
      error: "El SKU es obligatorio",
    })
    .min(1, "El SKU es obligatorio"),
  categoryId: requiredNumber("Selecciona una categoría", { min: 1 }).pipe(
    z.number().int("Selecciona una categoría válida")
  ),
  shortDesc: optionalString(255),
  description: z.string().optional(),
  stock: requiredNumber("El stock es obligatorio", { min: 0 }).pipe(
    z.number().int("El stock debe ser un número entero")
  ),
  price: requiredNumber("El precio es obligatorio", { min: 0 }),
  compareAtPrice: optionalNumber("El precio debe ser mayor o igual a 0", {
    min: 0,
  }),
  purchasePrice: optionalNumber("El costo debe ser mayor o igual a 0", {
    min: 0,
  }),
  weightGrams: optionalNumber("El peso debe ser mayor o igual a 0", {
    min: 0,
  }),
  length: optionalNumber("La longitud debe ser mayor o igual a 0", {
    min: 0,
  }),
  width: optionalNumber("El ancho debe ser mayor o igual a 0", { min: 0 }),
  height: optionalNumber("El alto debe ser mayor o igual a 0", { min: 0 }),
  status: z
    .enum(productStatuses.enumValues)
    .default("draft" as (typeof productStatuses.enumValues)[number]),
});

export const selectProductSchema = createSelectSchema(products);
export type InsertProduct = z.infer<typeof productInsertSchema>;
export type SelectProduct = z.infer<typeof selectProductSchema>;

export const productImageSchema = createSelectSchema(productImages);
export type SelectProductImage = z.infer<typeof productImageSchema>;

export const productImageInputSchema = z.object({
  url: z.string().url("La imagen debe ser una URL válida"),
  altText: optionalString(200),
});

export const productFormSchema = productInsertSchema.extend({
  images: z.array(productImageInputSchema).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export type ProductWithRelations = SelectProduct & {
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  images?: SelectProductImage[];
};

export type ProductListItem = SelectProduct & {
  category?: {
    id: number | null;
    name: string | null;
    slug: string | null;
  } | null;
  primaryImage?: string | null;
};

export const paginatedProductsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
  categoryId: z
    .union([z.coerce.number(), z.string()])
    .transform((val) => {
      if (typeof val === "string") {
        return val.split(",").map(Number).filter(Boolean);
      }
      return [val];
    })
    .optional(),
  status: z.enum(productStatuses.enumValues).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
});

export type GetPaginatedProductsQueryProps = z.infer<
  typeof paginatedProductsSchema
>;

// Schema para productos públicos (lobby) - solo activos con 12 por página
export const publicProductsSchema = paginatedProductsSchema.extend({
  per_page: z.coerce.number().default(12),
  status: z.literal("active").default("active"),
});

export type GetPublicProductsQueryProps = z.infer<typeof publicProductsSchema>;
