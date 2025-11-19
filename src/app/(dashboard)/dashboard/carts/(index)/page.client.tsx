"use client";

import { CheckCircle, Clock4, Package, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { createCartColumns } from "@/components/carts/columns";
import { DataTable } from "@/components/carts/data-table";
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
import type { CartListItem } from "@/schemas/cart.schema";
import type { PaginatedCarts } from "@/types/cart";
import { useDeleteCart } from "@/services/carts/mutations/cart.mutation";

interface CartsIndexProps {
  cartsPromise: Promise<PaginatedCarts>;
}

export default function CartsIndex({ cartsPromise }: CartsIndexProps) {
  const carts = React.use(cartsPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchValue, 500);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState<CartListItem>();

  const { mutate: deleteCart } = useDeleteCart();

  const handleDelete = (cart: CartListItem) => {
    setSelectedCart(cart);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCart) {
      deleteCart(selectedCart.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedCart(undefined);
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

    const newUrl = `/dashboard/carts?${params.toString()}`;
    const currentUrl = `/dashboard/carts?${searchParams.toString()}`;

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const stats = useMemo(() => {
    const data = carts.result.data;
    const total = carts.result.total;
    const active = data.filter((item) => item.status === "active").length;
    const converted = data.filter((item) => item.status === "converted").length;
    const abandoned = data.filter((item) => item.status === "abandoned").length;
    const items = data.reduce((acc, cart) => acc + cart.totalQuantity, 0);

    return { total, active, converted, abandoned, items };
  }, [carts]);

  const columns = createCartColumns(handleDelete);

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carritos</h1>
          <p className="text-muted-foreground">
            Gestiona los carritos activos y su estado de conversión
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/carts/create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo carrito
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Carritos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Clock4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">En seguimiento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">Pasados a pedido</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.items}</div>
            <p className="text-xs text-muted-foreground">Total de artículos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de carritos</CardTitle>
          <CardDescription>Consulta el detalle de cada carrito</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={carts.result.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por cliente o ID..."
            pageCount={carts.result.pageCount}
            currentPage={carts.result.currentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar carrito?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el carrito #{selectedCart?.id} y todos sus
              productos asociados.
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
