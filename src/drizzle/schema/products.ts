import {
  pgTable,
  integer,
  varchar,
  boolean,
  timestamp,
  decimal,
  text,
  pgEnum,
  unique,
  index,
  serial,
  AnyPgColumn,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";

// Tabla categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey().notNull(),
  parentId: integer("parent_id").references((): AnyPgColumn => categories.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  imageUrl: varchar("image_url", { length: 255 }),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date()
  ),
});

// Relaciones de categories
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent_fk",
  }),
  children: many(categories, {
    relationName: "category_parent_fk",
  }),
  products: many(products),
}));

export const productStatuses = pgEnum("product_statuses", [
  "active",
  "draft",
  "archived",
]);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey().notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 230 }).notNull().unique(),
    sku: varchar("sku", { length: 100 }).notNull().unique(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    shortDesc: varchar("short_desc", { length: 255 }),
    description: text("description"),
    stock: integer("stock").default(0).notNull(),
    price: decimal("price", { precision: 15, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 15, scale: 2 }),
    purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }),
    weightGrams: decimal("weight_grams", { precision: 15, scale: 2 }),
    length: decimal("length", { precision: 15, scale: 2 }),
    width: decimal("width", { precision: 15, scale: 2 }),
    height: decimal("height", { precision: 15, scale: 2 }),
    status: productStatuses("status").default("draft").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
      () => new Date()
    ),
  },
  (table) => [
    index("category_id_idx").on(table.categoryId),
    index("status_idx").on(table.status),
    check("price_non_negative", sql`${table.price} >= 0`),
    check("stock_non_negative", sql`${table.stock} >= 0`),
    check("weight_non_negative", sql`${table.weightGrams} >= 0`),
  ]
);

// Relaciones de products
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  cartItems: many(cartItems),
}));

// Tabla product_images
export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey().notNull(),
    productId: integer("product_id").notNull(),
    imageUrl: varchar("image_url", { length: 255 }).notNull(),
    altText: varchar("alt_text", { length: 200 }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("product_id_idx").on(table.productId)]
);

// Relaciones de product_images
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const cartsStatuses = pgEnum("cart_statuses", [
  "active",
  "converted",
  "abandoned",
]);

export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id"),
    status: cartsStatuses("status").default("active").notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
      () => new Date()
    ),
  },
  (table) => [index("user_id_idx").on(table.userId)]
);

// Relaciones de carts
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

// Tabla cart_items
export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey().notNull(),
    cartId: integer("cart_id").notNull(),
    productId: integer("product_id").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [unique("cart_product_unique").on(table.cartId, table.productId)]
);

// Relaciones de cart_items
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const couponsTypes = pgEnum("coupon_types", ["percent", "fixed"]);

// Tabla coupons
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey().notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  type: couponsTypes("type").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  minSubtotal: decimal("min_subtotal", { precision: 15, scale: 2 }),
  maxUses: integer("max_uses"),
  maxUsesPerUser: integer("max_uses_per_user"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date()
  ),
});

// Relaciones de coupons
export const couponsRelations = relations(coupons, ({ many }) => ({
  carts: many(carts),
}));
