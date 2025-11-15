"use server";

import { slugify } from "@/lib/utils";

import { db } from "@/drizzle/db";
import { categories } from "@/drizzle/schema";
import {
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import { PaginatedCategories } from "@/types/category";

import {
  Category,
  GetPaginatedCategoriesQueryProps,
} from "@/schemas/category.schema";
import { alias } from "drizzle-orm/pg-core";

export const getCategoriesInfinite = async (
  input: GetPaginatedCategoriesQueryProps
): Promise<PaginatedCategories> => {
  const offset = (input.page - 1) * input.per_page;

  const [column, order] = (input.sort?.split(".") as [
    keyof typeof categories.$inferSelect | undefined,
    "asc" | "desc" | undefined
  ]) ?? ["title", "desc"];

  const parent = alias(categories, "parent");

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        ...getTableColumns(categories),
        parent,
      })
      .from(categories)
      .leftJoin(parent, eq(parent.id, categories.parentId))
      .offset(offset)
      .limit(input.per_page)
      .where(
        or(input.name ? ilike(categories.name, `%${input.name}%`) : undefined)
      )
      .orderBy(
        column && column in categories
          ? order === "asc"
            ? asc(categories[column])
            : desc(categories[column])
          : desc(categories.createdAt)
      )
      .execute();

    const total = await tx
      .select({
        count: count(),
      })
      .from(categories)
      .where(
        or(input.name ? ilike(categories.name, `%${input.name}%`) : undefined)
      )
      .execute()
      .then((res) => res[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.per_page);

  return {
    data,
    pageCount,
    total,
    nextPage: input.page < pageCount ? input.page + 1 : null,
  };
};

export const getCategories = async (filters?: { notInIds: number[] }) => {
  const data = await db.query.categories.findMany({
    where: filters
      ? filters.notInIds
        ? notInArray(categories.id, filters.notInIds)
        : undefined
      : undefined,
  });
  return data;
};

export const getCategory = async (id: number) => {
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, id),
    with: {
      parent: true,
      children: true,
    },
    extras: {
      productsCount:
        sql<number>`(select count(*) from products where products.category_id = ${categories.id})`.as(
          "products_count"
        ),
    },
  });

  return category;
};

export const createCategory = async (input: Category) => {
  const category = await db
    .insert(categories)
    .values({
      ...input,
      slug: slugify(input.name),
    })
    .returning();
  return {
    message: `Category with id ${category[0].id} created successfully`,
    result: {
      id: category[0].id,
    },
  };
};

export const updateCategory = async (
  input: Partial<Category> & {
    id: number;
  }
) => {
  const [updated] = await db
    .update(categories)
    .set(input)
    .where(eq(categories.id, input.id))
    .returning({
      id: categories.id,
    });

  return {
    message: `Category with id ${updated.id} updated successfully`,
    result: {
      id: updated.id,
    },
  };
};

//deleteCategoryMutation
export const deleteCategory = async (id: number) => {
  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning({
      id: categories.id,
    });

  return {
    message: `Category with id ${deleted.id} deleted successfully`,
    result: {
      id: deleted.id,
    },
  };
};
