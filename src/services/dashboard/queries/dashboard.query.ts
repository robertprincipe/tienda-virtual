import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getOrdersByStatus,
  getCartsByStatus,
  getRevenueByMonth,
  getOrdersByMonth,
  getLowStockProducts,
  getRecentOrders,
  getTopCoupons,
  getCartConversionRate,
  getNewUsersByMonth,
} from "../actions/dashboard.actions";

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => await getDashboardStats(),
  });

export const useOrdersByStatus = () =>
  useQuery({
    queryKey: ["dashboard", "orders-by-status"],
    queryFn: async () => await getOrdersByStatus(),
  });

export const useCartsByStatus = () =>
  useQuery({
    queryKey: ["dashboard", "carts-by-status"],
    queryFn: async () => await getCartsByStatus(),
  });

export const useRevenueByMonth = () =>
  useQuery({
    queryKey: ["dashboard", "revenue-by-month"],
    queryFn: async () => await getRevenueByMonth(),
  });

export const useOrdersByMonth = () =>
  useQuery({
    queryKey: ["dashboard", "orders-by-month"],
    queryFn: async () => await getOrdersByMonth(),
  });

export const useLowStockProducts = () =>
  useQuery({
    queryKey: ["dashboard", "low-stock-products"],
    queryFn: async () => await getLowStockProducts(),
  });

export const useRecentOrders = (limit: number = 10) =>
  useQuery({
    queryKey: ["dashboard", "recent-orders", limit],
    queryFn: async () => await getRecentOrders(limit),
  });

export const useTopCoupons = () =>
  useQuery({
    queryKey: ["dashboard", "top-coupons"],
    queryFn: async () => await getTopCoupons(),
  });

export const useCartConversionRate = () =>
  useQuery({
    queryKey: ["dashboard", "cart-conversion-rate"],
    queryFn: async () => await getCartConversionRate(),
  });

export const useNewUsersByMonth = () =>
  useQuery({
    queryKey: ["dashboard", "new-users-by-month"],
    queryFn: async () => await getNewUsersByMonth(),
  });
