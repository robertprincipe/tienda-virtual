"use client";

import { FileText, Package, Plus } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import { createColumns } from "@/components/products/columns";
import { DataTable } from "@/components/products/data-table";
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
import type { ProductListItem } from "@/schemas/product.schema";
import type { PaginatedProducts } from "@/types/product";
import { useDeleteProduct } from "@/services/products/mutations/product.mutation";

interface ProductsIndexProps {
  productsPromise: Promise<PaginatedProducts>;
}

export default function ProductsIndex({ productsPromise }: ProductsIndexProps) {
  const products = React.use(productsPromise);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem>();

  const { mutate: deleteProduct } = useDeleteProduct();

  const handleDelete = (product: ProductListItem) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedProduct(undefined);
        },
      });
    }
  };

  const handleSearch = (value: string) => {
    // Implementar búsqueda con router si es necesario
    void value;
  };

  const stats = useMemo(() => {
    const total = products.result.total;
    const active = products.result.data.filter(
      (item) => item.status === "active"
    ).length;
    const draft = products.result.data.filter(
      (item) => item.status === "draft"
    ).length;
    const stock = products.result.data.reduce(
      (acc, item) => acc + (item.stock ?? 0),
      0
    );

    return { total, active, draft, stock };
  }, [products]);

  const columns = createColumns(handleDelete);

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Administra el catálogo de productos de tu tienda
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Productos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Publicado en tienda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventario total
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.stock}</div>
            <p className="text-xs text-muted-foreground">
              Unidades disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de productos</CardTitle>
          <CardDescription>Gestiona precios, stock y estado</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products.result.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nombre o SKU..."
            pageCount={products.result.pageCount}
            currentPage={products.result.currentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará &quot;{selectedProduct?.name}&quot; y no se
              podrá revertir.
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
