"use client";

import { FileText, Plus } from "lucide-react";
import { useState } from "react";

import { createColumns } from "@/components/categories/columns";
import { DataTable } from "@/components/categories/data-table";
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
import { type PaginatedCategories } from "@/types/category";
import Link from "next/link";
import { useDeleteCategory } from "@/services/categories/mutations/category.mutation";
import { SelectCategory } from "@/schemas/category.schema";

interface CategoriesIndexProps {
  categories: PaginatedCategories;
}

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    SelectCategory | undefined
  >();

  const { mutate: deleteCategoryMutate } = useDeleteCategory();

  const handleDelete = (category: SelectCategory) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutate(selectedCategory.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedCategory(undefined);
        },
      });
    }
  };

  const handleSearch = (value: string) => {
    // router.get(
    //   "/dashboard/categories",
    //   { search: value },
    //   { preserveState: true, replace: true }
    // );
  };

  const columns = createColumns(handleDelete);

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">
            Administra las categorías de tus productos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/categories/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categorías
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.total}</div>
            <p className="text-xs text-muted-foreground">
              Categorías registradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.data.filter((c) => c.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Categorías activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Productos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.data.filter((c) => (c.productsCount ?? 0) > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Categorías con productos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Categorías</CardTitle>
          <CardDescription>
            Gestiona y organiza tus categorías de productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categories.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nombre o slug..."
          />
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar categoría?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría &quot;
              {selectedCategory?.name}&quot;? Esta acción no se puede deshacer.
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
