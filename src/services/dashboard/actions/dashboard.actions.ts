"use server";

import { db } from "@/drizzle/db";
import { orders } from "@/drizzle/schema/orders";
import { products, carts, coupons } from "@/drizzle/schema";
import { users } from "@/drizzle/schema/users";
import { sql, count, sum, gte, lte, eq, and, desc } from "drizzle-orm";

/**
 * Obtener estadísticas generales del dashboard
 */
export async function getDashboardStats() {
  // Total de pedidos
  const [totalOrders] = await db.select({ count: count() }).from(orders);

  // Total de productos
  const [totalProducts] = await db.select({ count: count() }).from(products);

  // Total de usuarios registrados
  const [totalUsers] = await db.select({ count: count() }).from(users);

  // Total de carritos activos
  const [totalActiveCarts] = await db
    .select({ count: count() })
    .from(carts)
    .where(eq(carts.status, "active"));

  // Total de carritos convertidos
  const [totalConvertedCarts] = await db
    .select({ count: count() })
    .from(carts)
    .where(eq(carts.status, "converted"));

  // Total de carritos abandonados
  const [totalAbandonedCarts] = await db
    .select({ count: count() })
    .from(carts)
    .where(eq(carts.status, "abandoned"));

  // Total de cupones activos
  const [totalActiveCoupons] = await db
    .select({ count: count() })
    .from(coupons)
    .where(eq(coupons.isActive, true));

  // Ingresos totales
  const [revenue] = await db
    .select({
      total: sum(orders.total),
    })
    .from(orders)
    .where(eq(orders.status, "paid"));

  // Promedio de valor de orden
  const [avgOrderValue] = await db
    .select({
      avg: sql<string>`AVG(${orders.total})`,
    })
    .from(orders)
    .where(eq(orders.status, "paid"));

  return {
    totalOrders: totalOrders.count || 0,
    totalProducts: totalProducts.count || 0,
    totalUsers: totalUsers.count || 0,
    totalActiveCarts: totalActiveCarts.count || 0,
    totalConvertedCarts: totalConvertedCarts.count || 0,
    totalAbandonedCarts: totalAbandonedCarts.count || 0,
    totalActiveCoupons: totalActiveCoupons.count || 0,
    totalRevenue: parseFloat(revenue.total || "0"),
    avgOrderValue: parseFloat(avgOrderValue.avg || "0"),
  };
}

/**
 * Obtener estadísticas de pedidos por estado
 */
export async function getOrdersByStatus() {
  const ordersByStatus = await db
    .select({
      status: orders.status,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.status);

  return ordersByStatus.map((item) => ({
    status: item.status,
    count: item.count,
  }));
}

/**
 * Obtener estadísticas de carritos por estado
 */
export async function getCartsByStatus() {
  const cartsByStatus = await db
    .select({
      status: carts.status,
      count: count(),
    })
    .from(carts)
    .groupBy(carts.status);

  return cartsByStatus.map((item) => ({
    status: item.status,
    count: item.count,
  }));
}

/**
 * Obtener ingresos por mes (últimos 6 meses)
 */
export async function getRevenueByMonth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth = await db
    .select({
      month: sql<string>`TO_CHAR(${orders.placedAt}, 'Mon')`,
      monthNum: sql<number>`EXTRACT(MONTH FROM ${orders.placedAt})`,
      year: sql<number>`EXTRACT(YEAR FROM ${orders.placedAt})`,
      total: sum(orders.total),
    })
    .from(orders)
    .where(and(gte(orders.placedAt, sixMonthsAgo), eq(orders.status, "paid")))
    .groupBy(
      sql`TO_CHAR(${orders.placedAt}, 'Mon')`,
      sql`EXTRACT(MONTH FROM ${orders.placedAt})`,
      sql`EXTRACT(YEAR FROM ${orders.placedAt})`
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${orders.placedAt})`,
      sql`EXTRACT(MONTH FROM ${orders.placedAt})`
    );

  return revenueByMonth.map((item) => ({
    month: item.month,
    monthNum: item.monthNum,
    year: item.year,
    total: parseFloat(item.total || "0"),
  }));
}

/**
 * Obtener pedidos por mes (últimos 6 meses)
 */
export async function getOrdersByMonth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const ordersByMonth = await db
    .select({
      month: sql<string>`TO_CHAR(${orders.placedAt}, 'Mon')`,
      monthNum: sql<number>`EXTRACT(MONTH FROM ${orders.placedAt})`,
      year: sql<number>`EXTRACT(YEAR FROM ${orders.placedAt})`,
      count: count(),
    })
    .from(orders)
    .where(gte(orders.placedAt, sixMonthsAgo))
    .groupBy(
      sql`TO_CHAR(${orders.placedAt}, 'Mon')`,
      sql`EXTRACT(MONTH FROM ${orders.placedAt})`,
      sql`EXTRACT(YEAR FROM ${orders.placedAt})`
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${orders.placedAt})`,
      sql`EXTRACT(MONTH FROM ${orders.placedAt})`
    );

  return ordersByMonth.map((item) => ({
    month: item.month,
    monthNum: item.monthNum,
    year: item.year,
    count: item.count,
  }));
}

/**
 * Obtener productos con bajo stock
 */
export async function getLowStockProducts() {
  const lowStockProducts = await db
    .select({
      id: products.id,
      name: products.name,
      stock: products.stock,
      sku: products.sku,
    })
    .from(products)
    .where(lte(products.stock, 10))
    .orderBy(products.stock)
    .limit(10);

  return lowStockProducts;
}

/**
 * Obtener últimos pedidos
 */
export async function getRecentOrders(limit: number = 10) {
  const recentOrders = await db
    .select({
      id: orders.id,
      publicId: orders.publicId,
      email: orders.email,
      status: orders.status,
      total: orders.total,
      placedAt: orders.placedAt,
    })
    .from(orders)
    .orderBy(desc(orders.placedAt))
    .limit(limit);

  return recentOrders.map((order) => ({
    ...order,
    total: parseFloat(order.total),
  }));
}

/**
 * Obtener cupones más usados
 */
export async function getTopCoupons() {
  const topCoupons = await db
    .select({
      code: orders.couponCode,
      count: count(),
      totalDiscount: sum(orders.discount),
    })
    .from(orders)
    .where(sql`${orders.couponCode} IS NOT NULL`)
    .groupBy(orders.couponCode)
    .orderBy(desc(count()))
    .limit(10);

  return topCoupons.map((coupon) => ({
    code: coupon.code!,
    count: coupon.count,
    totalDiscount: parseFloat(coupon.totalDiscount || "0"),
  }));
}

/**
 * Obtener tasa de conversión de carritos
 */
export async function getCartConversionRate() {
  const [totalCartsResult] = await db.select({ count: count() }).from(carts);
  const [convertedCartsResult] = await db
    .select({ count: count() })
    .from(carts)
    .where(eq(carts.status, "converted"));

  const totalCarts = totalCartsResult.count || 0;
  const convertedCarts = convertedCartsResult.count || 0;

  const conversionRate =
    totalCarts > 0 ? (convertedCarts / totalCarts) * 100 : 0;

  return {
    totalCarts,
    convertedCarts,
    conversionRate: parseFloat(conversionRate.toFixed(2)),
  };
}

/**
 * Obtener estadísticas de usuarios nuevos por mes
 */
export async function getNewUsersByMonth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const usersByMonth = await db
    .select({
      month: sql<string>`TO_CHAR(${users.createdAt}, 'Mon')`,
      monthNum: sql<number>`EXTRACT(MONTH FROM ${users.createdAt})`,
      year: sql<number>`EXTRACT(YEAR FROM ${users.createdAt})`,
      count: count(),
    })
    .from(users)
    .where(gte(users.createdAt, sixMonthsAgo))
    .groupBy(
      sql`TO_CHAR(${users.createdAt}, 'Mon')`,
      sql`EXTRACT(MONTH FROM ${users.createdAt})`,
      sql`EXTRACT(YEAR FROM ${users.createdAt})`
    )
    .orderBy(
      sql`EXTRACT(YEAR FROM ${users.createdAt})`,
      sql`EXTRACT(MONTH FROM ${users.createdAt})`
    );

  return usersByMonth.map((item) => ({
    month: item.month,
    monthNum: item.monthNum,
    year: item.year,
    count: item.count,
  }));
}
