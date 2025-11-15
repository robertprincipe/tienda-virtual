"use client";

import { ArrowLeft, Edit, FolderTree, Package, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";

import Link from "next/link";

import { useDeleteCategory } from "@/services/categories/mutations/category.mutation";
import { useCategory } from "@/services/categories/queries/category.query";
import { notFound, useParams } from "next/navigation";
import { parseIntSafety } from "@/lib/utils";

export default function ShowCategory() {
  const params = useParams<{
    categoryId: string;
  }>();
  const { data: category } = useCategory(parseIntSafety(params.categoryId));
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { mutate } = useDeleteCategory();

  const handleDelete = () => {
    mutate(category?.id || 1);
  };

  if (!category) {
    notFound();
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {category.name}
              </h1>
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{category.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/categories/${category.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Principal</CardTitle>
            <CardDescription>Detalles básicos de la categoría</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Imagen
              </p>
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="mt-2 rounded-lg w-full max-w-md h-48 object-cover border"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-2">Sin imagen</p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nombre
              </p>
              <p className="text-lg">{category.name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Slug</p>
              <p className="font-mono text-sm">{category.slug}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Descripción
              </p>
              <p className="text-sm">
                {category.description || "Sin descripción"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Estado
              </p>
              <Badge
                variant={category.isActive ? "default" : "secondary"}
                className="mt-1"
              >
                {category.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Relaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Relaciones</CardTitle>
            <CardDescription>Jerarquía y productos asociados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Categoría Padre
              </p>
              {category.parent ? (
                <Link
                  href={`/dashboard/categories/${category.parent.id}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <FolderTree className="h-4 w-4" />
                  {category.parent.name}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin categoría padre (raíz)
                </p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Subcategorías
              </p>
              {category.children && category.children.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/dashboard/categories/${child.id}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FolderTree className="h-3 w-3" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin subcategorías
                </p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Productos
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {category.productsCount || 0}
                </span>
                <span className="text-sm text-muted-foreground">productos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadatos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Metadatos</CardTitle>
            <CardDescription>
              Información de creación y actualización
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de Creación
              </p>
              <p className="text-sm">
                {new Date(category.createdAt || "").toLocaleString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Última Actualización
              </p>
              <p className="text-sm">
                {new Date(category.updatedAt || "").toLocaleString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <p className="font-mono text-sm">#{category.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar categoría?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría &quot;
              {category.name}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
