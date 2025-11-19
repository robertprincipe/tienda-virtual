import { categories } from "@/drizzle/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesSchema = createInsertSchema(categories);
export type InsertCategorySchema = z.infer<typeof categoriesSchema>;

export const selectCategorySchema = createSelectSchema(categories);
export type CategorySelectSchema = z.infer<typeof selectCategorySchema>;

type CategoryAggregation = {
  parent?: Category | null;
  productsCount?: number;
  children?: Category[];
};

export type Category = InsertCategorySchema & CategoryAggregation;
export type SelectCategory = CategorySelectSchema & CategoryAggregation;

export const panginatedCategoriesSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type GetPaginatedCategoriesQueryProps = z.infer<
  typeof panginatedCategoriesSchema
>;
