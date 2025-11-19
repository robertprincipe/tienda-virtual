"use client";

import {
  CheckCircle2,
  DollarSign,
  Plus,
  ShoppingBag,
  TimerReset,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { createOrderColumns } from "@/components/orders/columns";
import { DataTable } from "@/components/orders/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OrderListItem } from "@/schemas/order.schema";
import type { PaginatedOrders } from "@/types/order";
import { useDeleteOrder } from "@/services/orders/mutations/order.mutation";

interface OrdersIndexProps {
  ordersPromise: Promise<PaginatedOrders>;
}

export default function OrdersIndex({ ordersPromise }: OrdersIndexProps) {
  const orders = React.use(ordersPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchValue, 500);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem>();

  const { mutate: deleteOrder } = useDeleteOrder();

  const handleDelete = (order: OrderListItem) => {
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      deleteOrder(selectedOrder.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedOrder(undefined);
        },
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    const newUrl = `/dashboard/orders?${params.toString()}`;
    const currentUrl = `/dashboard/orders?${searchParams.toString()}`;

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const stats = useMemo(() => {
    const data = orders.result.data;
    const total = orders.result.total;
    const created = data.filter((item) => item.status === "created").length;
    const completed = data.filter((item) => item.status === "delivered").length;
    const revenue = data.reduce(
      (acc, order) => acc + Number(order.total ?? 0),
      0
    );
    const avg = data.length > 0 ? revenue / data.length : 0;

    return { total, created, completed, revenue, avg };
  }, [orders]);

  const columns = createOrderColumns(handleDelete);

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Revisa el estado y los detalles de cada orden
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo pedido
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total órdenes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Histórico registrado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <TimerReset className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.created}</div>
            <p className="text-xs text-muted-foreground">
              Estado &quot;creada&quot;
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Pedidos finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos promedio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avg.toLocaleString("es-PE", {
                style: "currency",
                currency: "PEN",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Ticket promedio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de pedidos</CardTitle>
          <CardDescription>Gestiona estados y seguimiento</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders.result.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por ID o cliente..."
            pageCount={orders.result.pageCount}
            currentPage={orders.result.currentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar pedido?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente la orden &quot;
              {selectedOrder?.publicId}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
