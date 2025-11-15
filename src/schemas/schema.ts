import { z } from "zod/v4";

// ============================================================
// ENUMS
// ============================================================

export const OrderStatusSchema = z.enum([
  "created",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
]);

export const PaymentStatusSchema = z.enum([
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "canceled",
]);

// ============================================================
// ORDERS
// ============================================================

export const InsertOrderSchema = z.object({
  publicId: z.string().max(24),
  userId: z.number().int().positive().nullable().optional(),
  email: z.string().email().max(180),
  status: OrderStatusSchema.default("created"),
  subtotal: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .default("0.00"),
  discount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .default("0.00"),
  tax: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .default("0.00"),
  shipping: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .default("0.00"),
  total: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .default("0.00"),
  couponCode: z.string().max(60).nullable().optional(),
  notes: z.string().nullable().optional(),

  // Shipping address
  fullName: z.string().max(150),
  line1: z.string().max(200),
  line2: z.string().max(200).nullable().optional(),
  city: z.string().max(100),
  region: z.string().max(100).nullable().optional(),
  postalCode: z.string().max(20).nullable().optional(),
  countryCode: z.string().length(2),
  phone: z.string().max(32).nullable().optional(),

  // Shipping details
  shippingMethodName: z.string().max(120).nullable().optional(),
  shippingCarrier: z.string().max(60).nullable().optional(),
  shippingTrackingNumber: z.string().max(120).nullable().optional(),
  shippedAt: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),

  placedAt: z.date().default(() => new Date()),
  canceledAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
});

export const SelectOrderSchema = InsertOrderSchema.extend({
  id: z.number().int().positive(),
  updatedAt: z.date().nullable().optional(),
});

export const UpdateOrderSchema = InsertOrderSchema.partial();

export type InsertOrder = z.infer<typeof InsertOrderSchema>;
export type SelectOrder = z.infer<typeof SelectOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;

// ============================================================
// ORDER ITEMS
// ============================================================

export const InsertOrderItemSchema = z.object({
  orderId: z.number().int().positive(),
  productId: z.number().int().positive().nullable().optional(),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
  quantity: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export const SelectOrderItemSchema = InsertOrderItemSchema.extend({
  id: z.number().int().positive(),
});

export const UpdateOrderItemSchema = InsertOrderItemSchema.partial();

export type InsertOrderItem = z.infer<typeof InsertOrderItemSchema>;
export type SelectOrderItem = z.infer<typeof SelectOrderItemSchema>;
export type UpdateOrderItem = z.infer<typeof UpdateOrderItemSchema>;

// ============================================================
// PAYMENTS
// ============================================================

export const InsertPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  provider: z.string().max(50),
  method: z.string().max(50).nullable().optional(),
  status: PaymentStatusSchema.default("pending"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  transactionId: z.string().max(180).nullable().optional(),
  rawPayload: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable().optional(),
});

export const SelectPaymentSchema = InsertPaymentSchema.extend({
  id: z.number().int().positive(),
  updatedAt: z.date(),
});

export const UpdatePaymentSchema = InsertPaymentSchema.partial();

export type InsertPayment = z.infer<typeof InsertPaymentSchema>;
export type SelectPayment = z.infer<typeof SelectPaymentSchema>;
export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;

// ============================================================
// PRODUCT REVIEWS
// ============================================================

export const InsertProductReviewSchema = z.object({
  productId: z.number().int().positive(),
  userId: z.number().int().positive().nullable().optional(),
  rating: z
    .string()
    .regex(/^\d(\.\d)?$/)
    .refine((val) => parseFloat(val) >= 0 && parseFloat(val) <= 9.9, {
      message: "Rating must be between 0.0 and 9.9",
    }),
  title: z.string().max(150).nullable().optional(),
  body: z.string().nullable().optional(),
  isApproved: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  deletedAt: z.date().nullable().optional(),
});

export const SelectProductReviewSchema = InsertProductReviewSchema.extend({
  id: z.number().int().positive(),
  updatedAt: z.date(),
});

export const UpdateProductReviewSchema = InsertProductReviewSchema.partial();

export type InsertProductReview = z.infer<typeof InsertProductReviewSchema>;
export type SelectProductReview = z.infer<typeof SelectProductReviewSchema>;
export type UpdateProductReview = z.infer<typeof UpdateProductReviewSchema>;

// ============================================================
// COUPON REDEMPTIONS
// ============================================================

export const InsertCouponRedemptionSchema = z.object({
  couponId: z.number().int().positive(),
  userId: z.number().int().positive().nullable().optional(),
  orderId: z.number().int().positive().nullable().optional(),
  redeemedAt: z.date().default(() => new Date()),
});

export const SelectCouponRedemptionSchema = InsertCouponRedemptionSchema.extend(
  {
    id: z.number().int().positive(),
  }
);

export const UpdateCouponRedemptionSchema =
  InsertCouponRedemptionSchema.partial();

export type InsertCouponRedemption = z.infer<
  typeof InsertCouponRedemptionSchema
>;
export type SelectCouponRedemption = z.infer<
  typeof SelectCouponRedemptionSchema
>;
export type UpdateCouponRedemption = z.infer<
  typeof UpdateCouponRedemptionSchema
>;

// ============================================================
// COUPON PRODUCTS (Pivot Table)
// ============================================================

export const InsertCouponProductSchema = z.object({
  couponId: z.number().int().positive(),
  productId: z.number().int().positive(),
});

export const SelectCouponProductSchema = InsertCouponProductSchema;

export type InsertCouponProduct = z.infer<typeof InsertCouponProductSchema>;
export type SelectCouponProduct = z.infer<typeof SelectCouponProductSchema>;

// ============================================================
// COUPON CATEGORIES (Pivot Table)
// ============================================================

export const InsertCouponCategorySchema = z.object({
  couponId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
});

export const SelectCouponCategorySchema = InsertCouponCategorySchema;

export type InsertCouponCategory = z.infer<typeof InsertCouponCategorySchema>;
export type SelectCouponCategory = z.infer<typeof SelectCouponCategorySchema>;

// ============================================================
// STORE SETTINGS
// ============================================================

export const InsertStoreSettingsSchema = z.object({
  // Company information
  companyName: z.string().max(180),
  legalName: z.string().max(180).nullable().optional(),
  taxId: z.string().max(50).nullable().optional(),
  ruc: z.string().max(50).nullable().optional(),
  email: z.string().email().max(180).nullable().optional(),
  phone: z.string().max(32).nullable().optional(),

  // Company address
  companyLine1: z.string().max(200).nullable().optional(),
  companyLine2: z.string().max(200).nullable().optional(),
  companyCity: z.string().max(100).nullable().optional(),
  companyRegion: z.string().max(100).nullable().optional(),
  companyPostalCode: z.string().max(20).nullable().optional(),
  companyCountryCode: z.string().length(2).nullable().optional(),

  // Branding
  primaryColor: z
    .string()
    .max(20)
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/),
  secondaryColor: z
    .string()
    .max(20)
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .nullable()
    .optional(),
  accentColor: z
    .string()
    .max(20)
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .nullable()
    .optional(),
  fontFamily: z.string().max(100).nullable().optional(),

  // Store settings
  currency: z.string().length(3).default("USD"),
  timezone: z.string().max(60).default("America/Los_Angeles"),
  logoUrl: z.string().url().nullable().optional(),

  // Policies
  privacyPolicyHtml: z.string().nullable().optional(),
  termsHtml: z.string().nullable().optional(),
  shippingPolicyHtml: z.string().nullable().optional(),
  refundPolicyHtml: z.string().nullable().optional(),

  createdAt: z.date().default(() => new Date()),
});

export const SelectStoreSettingsSchema = InsertStoreSettingsSchema.extend({
  id: z.number().int().positive(),
  updatedAt: z.date(),
});

export const UpdateStoreSettingsSchema = InsertStoreSettingsSchema.partial();

export type InsertStoreSettings = z.infer<typeof InsertStoreSettingsSchema>;
export type SelectStoreSettings = z.infer<typeof SelectStoreSettingsSchema>;
export type UpdateStoreSettings = z.infer<typeof UpdateStoreSettingsSchema>;

// ============================================================
// VALIDATION HELPERS
// ============================================================

// Helper para validar decimales de dinero
export const moneySchema = z.string().regex(/^\d+(\.\d{1,2})?$/, {
  message: "Must be a valid decimal with up to 2 decimal places",
});

// Helper para validar códigos de país
export const countryCodeSchema = z
  .string()
  .length(2)
  .regex(/^[A-Z]{2}$/, {
    message: "Must be a valid 2-letter ISO country code",
  });

// Helper para validar códigos de moneda
export const currencyCodeSchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, {
    message: "Must be a valid 3-letter ISO currency code",
  });
