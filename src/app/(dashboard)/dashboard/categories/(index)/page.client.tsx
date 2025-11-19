"use client";

import { FileText, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

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
import React from "react";

interface CategoriesIndexProps {
  categoriesPromise: Promise<PaginatedCategories>;
}

export default function CategoriesIndex({
  categoriesPromise,
}: CategoriesIndexProps) {
  const categories = React.use(categoriesPromise);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchValue, 500);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    SelectCategory | undefined
  >();

  const { mutate: deleteCategoryMutate, isPending: isPendingDeleteCategory } =
    useDeleteCategory();

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

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    const newUrl = `/dashboard/categories?${params.toString()}`;
    const currentUrl = `/dashboard/categories?${searchParams.toString()}`;

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
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
            <div className="text-2xl font-bold">{categories.result.total}</div>
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
              {categories.result.data.filter((c) => c.isActive).length}
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
              {
                categories.result.data.filter((c) => (c.productsCount ?? 0) > 0)
                  .length
              }
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
            data={categories.result.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por nombre o slug..."
            pageCount={categories.result.pageCount}
            currentPage={categories.result.currentPage}
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
            <Button
              variant="outline"
              disabled={isPendingDeleteCategory}
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isPendingDeleteCategory}
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
