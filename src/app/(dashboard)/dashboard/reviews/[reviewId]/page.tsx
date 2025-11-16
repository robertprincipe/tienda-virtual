"use client";

import { useState } from "react";
import { ArrowLeft, Edit, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

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
import { useDeleteReview } from "@/services/reviews/mutations/review.mutation";
import { useReview } from "@/services/reviews/queries/review.query";
import { parseIntSafety } from "@/lib/utils";

const formatDateTime = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReviewDetailPage() {
  const params = useParams<{ reviewId: string }>();
  const reviewId = parseIntSafety(params.reviewId);

  const { data: review, isLoading } = useReview(reviewId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate, isPending } = useDeleteReview();

  if (isLoading) {
    return <div className="p-6">Cargando reseña...</div>;
  }

  if (!review) {
    notFound();
  }

  const handleDelete = () => {
    mutate(review.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
      },
    });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/reviews">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Reseña #{review.id}
              </h1>
              <Badge variant={review.isApproved ? "default" : "secondary"}>
                {review.isApproved ? "Aprobada" : "Pendiente"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Publicada el {formatDateTime(review.createdAt as Date | string)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/reviews/${review.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contenido</CardTitle>
            <CardDescription>Detalles de la reseña</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Star className="h-5 w-5 text-yellow-500" />
              {Number(review.rating ?? 0).toFixed(1)} / 9.9
            </div>
            {review.title && <p className="text-lg font-medium">{review.title}</p>}
            <p className="text-sm">
              {review.body?.trim() ? review.body : "Sin comentarios adicionales."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
            <CardDescription>Seguimiento de aprobación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">¿Aprobada?</span>
              <Badge variant={review.isApproved ? "default" : "secondary"}>
                {review.isApproved ? "Sí" : "No"}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground">Última actualización</p>
              <p>{formatDateTime(review.updatedAt as Date | string)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Producto</CardTitle>
            <CardDescription>Información del artículo reseñado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {review.product ? (
              <div>
                <p className="font-medium">{review.product.name}</p>
                <Link
                  href={`/dashboard/products/${review.product.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Ver producto
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground">Producto eliminado</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
            <CardDescription>Autor de la reseña</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {review.user ? (
              <div>
                <p className="font-medium">{review.user.name ?? "Sin nombre"}</p>
                <p className="text-muted-foreground">{review.user.email}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Registrada como invitado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar reseña?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará la reseña #{review.id} de forma permanente.
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
