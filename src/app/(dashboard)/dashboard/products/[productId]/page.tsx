"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
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
import { parseIntSafety } from "@/lib/utils";
import { useDeleteProduct } from "@/services/products/mutations/product.mutation";
import { useProduct } from "@/services/products/queries/product.query";
import { formatCurrency } from "@/lib/currency";

const formatDate = (value?: Date | string | null) => {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = parseIntSafety(params.productId);

  const { data: product, isLoading } = useProduct(productId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate, isPending } = useDeleteProduct();

  if (isLoading) {
    return <div className="p-6">Cargando producto...</div>;
  }

  if (!product) {
    notFound();
  }

  const statusLabel =
    product.status === "active"
      ? "Activo"
      : product.status === "draft"
      ? "Borrador"
      : "Archivado";

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {product.name}
              </h1>
              <Badge
                variant={
                  product.status === "active"
                    ? "default"
                    : product.status === "draft"
                    ? "secondary"
                    : "outline"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
            <CardDescription>Información general del producto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Descripción
              </p>
              <p className="text-sm">
                {product.description || "Sin descripción disponible"}
              </p>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Precio actual
                </p>
                <p className="text-xl font-semibold">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Precio anterior
                </p>
                <p>{formatCurrency(product.compareAtPrice)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Costo
                </p>
                <p>{formatCurrency(product.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stock disponible
                </p>
                <p>{product.stock ?? 0} unidades</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Peso (g)
                </p>
                <p>{product.weightGrams ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dimensiones (L x A x H cm)
                </p>
                <p>
                  {product.length ?? "-"} x {product.width ?? "-"} x{" "}
                  {product.height ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Creado el
                </p>
                <p>{formatDate(product.createdAt as Date | string)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Relaciones</CardTitle>
            <CardDescription>Categoría y recursos asociados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Categoría
              </p>
              {product.category ? (
                <Link
                  href={`/dashboard/categories/${product.category.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {product.category.name}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Sin categoría</p>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Identificadores
              </p>
              <p className="text-sm">Slug: {product.slug}</p>
              <p className="text-sm">ID interno: {product.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galería</CardTitle>
          <CardDescription>Imágenes asociadas al producto</CardDescription>
        </CardHeader>
        <CardContent>
          {product.images && product.images.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-lg border"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || product.name}
                    className="h-40 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este producto no tiene imágenes registradas.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará definitivamente "{product.name}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                mutate(product.id, {
                  onSuccess: () => setIsDeleteOpen(false),
                })
              }
              disabled={isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
