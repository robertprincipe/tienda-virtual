import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  decimal,
  pgEnum,
  index,
  primaryKey,
  json,
  char,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories, coupons, products } from "./products";
import { users } from "./users";

// Enums
export const orderStatusEnum = pgEnum("order_status", [
  "created",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "canceled",
]);

// Tabla pivot coupon_products (muchos a muchos)
export const couponProducts = pgTable(
  "coupon_products",
  {
    couponId: integer("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.couponId, table.productId] })]
);

// Relaciones de coupon_products
export const couponProductsRelations = relations(couponProducts, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponProducts.couponId],
    references: [coupons.id],
  }),
  product: one(products, {
    fields: [couponProducts.productId],
    references: [products.id],
  }),
}));

// Tabla pivot coupon_categories (muchos a muchos)
export const couponCategories = pgTable(
  "coupon_categories",
  {
    couponId: integer("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.couponId, table.categoryId] })]
);

// Relaciones de coupon_categories
export const couponCategoriesRelations = relations(
  couponCategories,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponCategories.couponId],
      references: [coupons.id],
    }),
    category: one(categories, {
      fields: [couponCategories.categoryId],
      references: [categories.id],
    }),
  })
);

// Tabla orders
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey().notNull(),
    publicId: varchar("public_id", { length: 60 }).notNull().unique(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    email: varchar("email", { length: 180 }).notNull(),
    status: orderStatusEnum("status").default("created").notNull(),
    subtotal: decimal("subtotal", { precision: 15, scale: 2 })
      .default("0.00")
      .notNull(),
    discount: decimal("discount", { precision: 15, scale: 2 })
      .default("0.00")
      .notNull(),
    tax: decimal("tax", { precision: 15, scale: 2 }).default("0.00").notNull(),
    shipping: decimal("shipping", { precision: 15, scale: 2 })
      .default("0.00")
      .notNull(),
    total: decimal("total", { precision: 15, scale: 2 })
      .default("0.00")
      .notNull(),
    couponCode: varchar("coupon_code", { length: 60 }),
    notes: text("notes"),

    // Shipping address snapshot
    fullName: varchar("full_name", { length: 150 }).notNull(),
    line1: varchar("line1", { length: 200 }).notNull(),
    line2: varchar("line2", { length: 200 }),
    city: varchar("city", { length: 100 }).notNull(),
    region: varchar("region", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    countryCode: char("country_code", { length: 2 }).notNull(),
    phone: varchar("phone", { length: 32 }),

    // Shipping details
    shippingMethodName: varchar("shipping_method_name", { length: 120 }),
    shippingCarrier: varchar("shipping_carrier", { length: 60 }),
    shippingTrackingNumber: varchar("shipping_tracking_number", {
      length: 120,
    }),
    shippedAt: timestamp("shipped_at", { mode: "date" }),
    deliveredAt: timestamp("delivered_at", { mode: "date" }),

    // Timestamps
    placedAt: timestamp("placed_at", { mode: "date" }).defaultNow().notNull(),
    canceledAt: timestamp("canceled_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
      () => new Date()
    ),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
  ]
);

// Relaciones de orders
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  payments: many(payments),
  redemptions: many(couponRedemptions),
}));

// Tabla order_items
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey().notNull(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
    quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)]
);

// Relaciones de order_items
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Tabla payments
export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey().notNull(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(),
    method: varchar("method", { length: 50 }),
    status: paymentStatusEnum("status").default("pending").notNull(),
    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    transactionId: varchar("transaction_id", { length: 180 }),
    rawPayload: json("raw_payload"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
      () => new Date()
    ),
  },
  (table) => [
    index("payments_order_id_idx").on(table.orderId),
    index("payments_status_idx").on(table.status),
  ]
);

// Relaciones de payments
export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// Tabla product_reviews
export const productReviews = pgTable(
  "product_reviews",
  {
    id: serial("id").primaryKey().notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    rating: decimal("rating", { precision: 2, scale: 1 }).notNull(), // 0.0 a 9.9
    title: varchar("title", { length: 150 }),
    body: text("body"),
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
      () => new Date()
    ),
  },
  (table) => [
    index("product_reviews_product_id_idx").on(table.productId),
    index("product_reviews_is_approved_idx").on(table.isApproved),
  ]
);

// Relaciones de product_reviews
export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productReviews.userId],
    references: [users.id],
  }),
}));

// Tabla coupon_redemptions
export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: serial("id").primaryKey().notNull(),
    couponId: integer("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    orderId: integer("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    redeemedAt: timestamp("redeemed_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("coupon_redemptions_coupon_id_idx").on(table.couponId)]
);

// Relaciones de coupon_redemptions
export const couponRedemptionsRelations = relations(
  couponRedemptions,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponRedemptions.couponId],
      references: [coupons.id],
    }),
    user: one(users, {
      fields: [couponRedemptions.userId],
      references: [users.id],
    }),
    order: one(orders, {
      fields: [couponRedemptions.orderId],
      references: [orders.id],
    }),
  })
);

// Tabla store_settings
export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey().notNull(),

  // Company information
  companyName: varchar("company_name", { length: 180 }).notNull(),
  legalName: varchar("legal_name", { length: 180 }),
  taxId: varchar("tax_id", { length: 50 }),
  ruc: varchar("ruc", { length: 50 }),
  email: varchar("email", { length: 180 }),
  phone: varchar("phone", { length: 32 }),

  // Company address
  companyLine1: varchar("company_line1", { length: 200 }),
  companyLine2: varchar("company_line2", { length: 200 }),
  companyCity: varchar("company_city", { length: 100 }),
  companyRegion: varchar("company_region", { length: 100 }),
  companyPostalCode: varchar("company_postal_code", { length: 20 }),
  companyCountryCode: char("company_country_code", { length: 2 }),

  // Branding
  primaryColor: varchar("primary_color", { length: 20 }).notNull(),
  secondaryColor: varchar("secondary_color", { length: 20 }),
  accentColor: varchar("accent_color", { length: 20 }),
  fontFamily: varchar("font_family", { length: 100 }),

  // Store settings
  currency: char("currency", { length: 3 }).default("USD").notNull(),
  timezone: varchar("timezone", { length: 60 })
    .default("America/Los_Angeles")
    .notNull(),
  logoUrl: text("logo_url"),

  // Policies
  privacyPolicyHtml: text("privacy_policy_html"),
  termsHtml: text("terms_html"),
  shippingPolicyHtml: text("shipping_policy_html"),
  refundPolicyHtml: text("refund_policy_html"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdateFn(
    () => new Date()
  ),
});
