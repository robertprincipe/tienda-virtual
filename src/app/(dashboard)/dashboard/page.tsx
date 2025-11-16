"use client";

import {
  useDashboardStats,
  useOrdersByStatus,
  useCartsByStatus,
  useRevenueByMonth,
  useOrdersByMonth,
  useLowStockProducts,
  useRecentOrders,
  useTopCoupons,
  useCartConversionRate,
  useNewUsersByMonth,
} from "@/services/dashboard/queries/dashboard.query";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { LowStockTable } from "@/components/dashboard/low-stock-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Ticket,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: ordersByStatus, isLoading: ordersByStatusLoading } =
    useOrdersByStatus();
  const { data: cartsByStatus, isLoading: cartsByStatusLoading } =
    useCartsByStatus();
  const { data: revenueByMonth, isLoading: revenueLoading } =
    useRevenueByMonth();
  const { data: ordersByMonth, isLoading: ordersLoading } = useOrdersByMonth();
  const { data: lowStockProducts, isLoading: lowStockLoading } =
    useLowStockProducts();
  const { data: recentOrders, isLoading: recentOrdersLoading } =
    useRecentOrders(10);
  const { data: topCoupons, isLoading: topCouponsLoading } = useTopCoupons();
  const { data: conversionRate, isLoading: conversionLoading } =
    useCartConversionRate();
  const { data: newUsersByMonth, isLoading: usersLoading } =
    useNewUsersByMonth();

  // Chart configs
  const revenueChartConfig = {
    total: {
      label: "Ingresos",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const ordersChartConfig = {
    count: {
      label: "Pedidos",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const usersChartConfig = {
    count: {
      label: "Nuevos Usuarios",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  if (statsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vista general de tu tienda</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Pedidos"
          value={stats?.totalOrders || 0}
          icon={ShoppingBag}
          description="Pedidos realizados"
        />
        <StatCard
          title="Ingresos Totales"
          value={`S/ ${(stats?.totalRevenue || 0).toFixed(2)}`}
          icon={DollarSign}
          description="Ingresos generados"
        />
        <StatCard
          title="Productos"
          value={stats?.totalProducts || 0}
          icon={Package}
          description="Productos en catálogo"
        />
        <StatCard
          title="Usuarios Registrados"
          value={stats?.totalUsers || 0}
          icon={Users}
          description="Clientes registrados"
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Carritos Activos"
          value={stats?.totalActiveCarts || 0}
          icon={ShoppingCart}
          description="Carritos en proceso"
        />
        <StatCard
          title="Carritos Convertidos"
          value={stats?.totalConvertedCarts || 0}
          icon={TrendingUp}
          description="Carritos finalizados"
        />
        <StatCard
          title="Cupones Activos"
          value={stats?.totalActiveCoupons || 0}
          icon={Ticket}
          description="Cupones disponibles"
        />
        <StatCard
          title="Valor Promedio"
          value={`S/ ${(stats?.avgOrderValue || 0).toFixed(2)}`}
          icon={Activity}
          description="Valor promedio por pedido"
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Ingresos por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
            <CardDescription>Ingresos de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ChartContainer config={revenueChartConfig} className="h-[300px]">
                <BarChart data={revenueByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Pedidos por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Mensuales</CardTitle>
            <CardDescription>
              Cantidad de pedidos de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ChartContainer config={ordersChartConfig} className="h-[300px]">
                <LineChart data={ordersByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de distribución */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pedidos por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Estado</CardTitle>
            <CardDescription>
              Distribución de pedidos según su estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersByStatusLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(ordersByStatus || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Carritos por estado */}
        <Card>
          <CardHeader>
            <CardTitle>Carritos por Estado</CardTitle>
            <CardDescription>
              Distribución de carritos de compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cartsByStatusLoading ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cartsByStatus || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {(cartsByStatus || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nuevos usuarios por mes */}
      <Card>
        <CardHeader>
          <CardTitle>Nuevos Usuarios</CardTitle>
          <CardDescription>
            Usuarios registrados en los últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <ChartContainer config={usersChartConfig} className="h-[300px]">
              <BarChart data={newUsersByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Tasa de conversión */}
      {!conversionLoading && conversionRate && (
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Conversión de Carritos</CardTitle>
            <CardDescription>
              Porcentaje de carritos que se convierten en pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {conversionRate.totalCarts}
                </p>
                <p className="text-sm text-muted-foreground">Total Carritos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {conversionRate.convertedCarts}
                </p>
                <p className="text-sm text-muted-foreground">Convertidos</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {conversionRate.conversionRate}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Tasa de Conversión
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cupones más usados */}
      {!topCouponsLoading && topCoupons && topCoupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cupones Más Usados</CardTitle>
            <CardDescription>Top 10 cupones más utilizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCoupons.map((coupon, index) => (
                <div
                  key={coupon.code}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{coupon.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {coupon.count} usos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      S/ {coupon.totalDiscount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total descuento
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tablas de datos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pedidos recientes */}
        {!recentOrdersLoading && recentOrders && (
          <RecentOrdersTable orders={recentOrders} />
        )}

        {/* Productos con bajo stock */}
        {!lowStockLoading && lowStockProducts && (
          <LowStockTable products={lowStockProducts} />
        )}
      </div>
    </div>
  );
}
