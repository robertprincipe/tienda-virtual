"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import type { CouponWithRelations } from "@/schemas/coupon.schema";
import { useDeleteCoupon } from "@/services/coupons/mutations/coupon.mutation";

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(numericValue);
};

const formatDate = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface CouponDetailPageProps {
  coupon: CouponWithRelations;
}

export default function CouponDetailPage({ coupon }: CouponDetailPageProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const router = useRouter();
  const { mutate: deleteCoupon, isPending } = useDeleteCoupon();

  const handleDelete = () => {
    deleteCoupon(coupon.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        router.push("/dashboard/coupons");
        router.refresh();
      },
    });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/coupons">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{coupon.code}</h1>
              <Badge variant={coupon.isActive ? "default" : "secondary"}>
                {coupon.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {coupon.type === "percent" ? "Porcentaje" : "Monto fijo"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/coupons/${coupon.id}/edit`}>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
            <CardDescription>Información general del cupón</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Valor
              </p>
              <p className="text-lg">
                {coupon.type === "percent"
                  ? `${coupon.value}%`
                  : formatCurrency(coupon.value)}
              </p>
            </div>
            <Separator />
            <div className="grid gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Subtotal mínimo
              </p>
              <p>{coupon.minSubtotal ? formatCurrency(coupon.minSubtotal) : "-"}</p>
            </div>
            <Separator />
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Máximo de usos
                </p>
                <p>{coupon.maxUses ?? "Ilimitado"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Usos por cliente
                </p>
                <p>{coupon.maxUsesPerUser ?? "Ilimitado"}</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Inicia
                </p>
                <p>{coupon.startsAt ? formatDate(coupon.startsAt) : "Sin fecha"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Finaliza
                </p>
                <p>{coupon.endsAt ? formatDate(coupon.endsAt) : "Sin fecha"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relaciones</CardTitle>
            <CardDescription>
              Productos y categorías incluidos en la promoción
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Productos
              </p>
              {coupon.products.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay productos asociados.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {coupon.products.map((product) => (
                    <li key={product.id} className="flex items-center justify-between">
                      <span>{product.name}</span>
                      {product.sku && (
                        <span className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Categorías
              </p>
              {coupon.categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay categorías asociadas.
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm">
                  {coupon.categories.map((category) => (
                    <li key={category.id}>{category.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cupón?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente "{coupon.code}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
