import { productReviews } from "@/drizzle/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const preprocessNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
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

const optionalString = (max = 255) =>
  z
    .string()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined);

export const reviewInsertSchema = createInsertSchema(productReviews, {
  productId: z.preprocess(
    preprocessNumber,
    z.number().int("Selecciona un producto")
  ),
  userId: z
    .preprocess(
      preprocessNumber,
      z.number().int("Selecciona un usuario válido").optional()
    )
    .optional(),
  rating: z
    .preprocess(
      preprocessNumber,
      z.number().min(0, "La calificación debe ser positiva")
    )
    .refine((val) => val !== undefined, "La calificación es obligatoria"),
  title: optionalString(150),
  body: optionalString(1000),
  isApproved: z.boolean().default(false),
});

export const reviewFormSchema = reviewInsertSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    rating: z.preprocess(preprocessNumber, z.number()),
    isApproved: z.boolean().default(false),
  });

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export type ReviewWithRelations = Omit<
  typeof productReviews.$inferSelect,
  "rating"
> & {
  rating: number;
  product?: {
    id: number;
    name: string | null;
    slug: string | null;
  } | null;
  user?: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
};

export type ReviewListItem = ReviewWithRelations;

export const paginatedReviewsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
  isApproved: z
    .union([z.literal("true"), z.literal("false")])
    .transform((val) => val === "true")
    .optional(),
});

export type GetPaginatedReviewsQueryProps = z.infer<
  typeof paginatedReviewsSchema
>;
