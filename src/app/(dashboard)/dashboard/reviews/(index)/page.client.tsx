"use client";

import { CheckCircle2, MessageSquare, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import { createReviewColumns } from "@/components/reviews/columns";
import { DataTable } from "@/components/reviews/data-table";
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
import type { ReviewListItem } from "@/schemas/product-review.schema";
import type { PaginatedReviews } from "@/types/review";
import { useDeleteReview } from "@/services/reviews/mutations/review.mutation";

interface ReviewsIndexProps {
  reviewsPromise: Promise<PaginatedReviews>;
}

export default function ReviewsIndex({ reviewsPromise }: ReviewsIndexProps) {
  const reviews = React.use(reviewsPromise);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewListItem>();

  const { mutate: deleteReview } = useDeleteReview();

  const handleDelete = (review: ReviewListItem) => {
    setSelectedReview(review);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedReview) {
      deleteReview(selectedReview.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedReview(undefined);
        },
      });
    }
  };

  const handleSearch = (value: string) => {
    void value;
  };

  const stats = useMemo(() => {
    const data = reviews.result.data;
    const total = reviews.result.total;
    const approved = data.filter((item) => item.isApproved).length;
    const pending = data.filter((item) => !item.isApproved).length;
    const avgRating = data.length
      ? data.reduce((acc, item) => acc + Number(item.rating ?? 0), 0) /
        data.length
      : 0;

    return { total, approved, pending, avgRating };
  }, [reviews]);

  const columns = createReviewColumns(handleDelete);

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reseñas</h1>
          <p className="text-muted-foreground">
            Administra la retroalimentación enviada por tus clientes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reviews/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva reseña
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Reseñas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Visibles en tienda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">En espera de revisión</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Calificación promedio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de reseñas</CardTitle>
          <CardDescription>Aprueba o rechaza reseñas enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reviews.result.data}
            onSearch={handleSearch}
            searchPlaceholder="Buscar por producto o cliente..."
            pageCount={reviews.result.pageCount}
            currentPage={reviews.result.currentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar reseña?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará la reseña de {selectedReview?.product?.name ?? "producto"}.
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
