CREATE TYPE "public"."cart_statuses" AS ENUM('active', 'converted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."coupon_types" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."product_statuses" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('created', 'paid', 'processing', 'shipped', 'delivered', 'canceled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'authorized', 'captured', 'failed', 'refunded', 'canceled');--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"paternal_last_name" varchar(255),
	"maternal_last_name" varchar(255),
	"full_name" varchar(150),
	"line1" varchar(200),
	"line2" varchar(200),
	"city" varchar(100),
	"region" varchar(100),
	"phone" varchar(32),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"remember_token" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "cart_product_unique" UNIQUE("cart_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"status" "cart_statuses" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"name" varchar(150) NOT NULL,
	"slug" varchar(180) NOT NULL,
	"image_url" varchar(255),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"type" "coupon_types" NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"min_subtotal" numeric(15, 2),
	"max_uses" integer,
	"max_uses_per_user" integer,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"alt_text" varchar(200),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(230) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"category_id" integer NOT NULL,
	"short_desc" varchar(255),
	"description" text,
	"stock" integer DEFAULT 0 NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"compare_at_price" numeric(15, 2),
	"purchase_price" numeric(15, 2),
	"weight_grams" numeric(15, 2),
	"length" numeric(15, 2),
	"width" numeric(15, 2),
	"height" numeric(15, 2),
	"status" "product_statuses" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "price_non_negative" CHECK ("products"."price" >= 0),
	CONSTRAINT "stock_non_negative" CHECK ("products"."stock" >= 0),
	CONSTRAINT "weight_non_negative" CHECK ("products"."weight_grams" >= 0)
);
--> statement-breakpoint
CREATE TABLE "coupon_categories" (
	"coupon_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	CONSTRAINT "coupon_categories_coupon_id_category_id_pk" PRIMARY KEY("coupon_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "coupon_products" (
	"coupon_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	CONSTRAINT "coupon_products_coupon_id_product_id_pk" PRIMARY KEY("coupon_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"coupon_id" integer NOT NULL,
	"user_id" integer,
	"order_id" integer,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"unit_price" numeric(15, 2) NOT NULL,
	"quantity" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(60) NOT NULL,
	"user_id" integer,
	"email" varchar(180) NOT NULL,
	"status" "order_status" DEFAULT 'created' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"tax" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"shipping" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"total" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"coupon_code" varchar(60),
	"notes" text,
	"full_name" varchar(150) NOT NULL,
	"line1" varchar(200) NOT NULL,
	"line2" varchar(200),
	"city" varchar(100) NOT NULL,
	"region" varchar(100),
	"postal_code" varchar(20),
	"country_code" char(2) NOT NULL,
	"phone" varchar(32),
	"shipping_method_name" varchar(120),
	"shipping_carrier" varchar(60),
	"shipping_tracking_number" varchar(120),
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"placed_at" timestamp DEFAULT now() NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "orders_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"provider" varchar(50) NOT NULL,
	"method" varchar(50),
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"transaction_id" varchar(180),
	"raw_payload" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" integer,
	"rating" numeric(2, 1) NOT NULL,
	"title" varchar(150),
	"body" text,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(180) NOT NULL,
	"legal_name" varchar(180),
	"tax_id" varchar(50),
	"ruc" varchar(50),
	"email" varchar(180),
	"phone" varchar(32),
	"company_line1" varchar(200),
	"company_line2" varchar(200),
	"company_city" varchar(100),
	"company_region" varchar(100),
	"company_postal_code" varchar(20),
	"company_country_code" char(2),
	"primary_color" varchar(20) NOT NULL,
	"secondary_color" varchar(20),
	"accent_color" varchar(20),
	"font_family" varchar(100),
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"timezone" varchar(60) DEFAULT 'America/Los_Angeles' NOT NULL,
	"logo_url" text,
	"privacy_policy_html" text,
	"terms_html" text,
	"shipping_policy_html" text,
	"refund_policy_html" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "coupon_categories" ADD CONSTRAINT "coupon_categories_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_categories" ADD CONSTRAINT "coupon_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_products" ADD CONSTRAINT "coupon_products_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_products" ADD CONSTRAINT "coupon_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "product_id_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "coupon_redemptions_coupon_id_idx" ON "coupon_redemptions" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_reviews_product_id_idx" ON "product_reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_reviews_is_approved_idx" ON "product_reviews" USING btree ("is_approved");