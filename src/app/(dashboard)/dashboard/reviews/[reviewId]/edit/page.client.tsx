"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ReviewForm } from "@/components/reviews/review-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReviewFormValues, ReviewWithRelations } from "@/schemas/product-review.schema";
import { useUpdateReview } from "@/services/reviews/mutations/review.mutation";

interface EditReviewPageProps {
  review: ReviewWithRelations;
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{ id: number; name: string; sku?: string | null }>;
}

export default function EditReviewPage({ review, users, products }: EditReviewPageProps) {
  const { mutate, isPending } = useUpdateReview();

  const defaultValues = useMemo<ReviewFormValues>(
    () => ({
      productId: review.productId,
      userId: review.userId ?? undefined,
      rating: Number(review.rating ?? 0),
      title: review.title ?? "",
      body: review.body ?? "",
      isApproved: review.isApproved ?? false,
    }),
    [review]
  );

  const handleSubmit = (values: ReviewFormValues) => {
    mutate({ ...values, id: review.id });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/reviews/${review.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar reseña #{review.id}
          </h1>
          <p className="text-muted-foreground">
            Actualiza la reseña y su estado de publicación
          </p>
        </div>
      </div>

      {products.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay productos disponibles</AlertTitle>
          <AlertDescription>
            Debes crear productos antes de editar reseñas.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información de la reseña</CardTitle>
          <CardDescription>Modifica el contenido cuando sea necesario</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            users={users}
            products={products}
            isSubmitting={isPending}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  );
}
