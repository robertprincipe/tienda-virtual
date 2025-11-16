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
import type { ReviewFormValues } from "@/schemas/product-review.schema";
import { useCreateReviewAdmin } from "@/services/reviews/mutations/review.mutation";

interface CreateReviewPageProps {
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{ id: number; name: string; sku?: string | null }>;
}

export default function CreateReviewPage({ users, products }: CreateReviewPageProps) {
  const { mutate, isPending } = useCreateReviewAdmin();

  const defaultValues = useMemo<ReviewFormValues>(
    () => ({
      productId: products[0]?.id ?? 0,
      userId: undefined,
      rating: 5,
      title: "",
      body: "",
      isApproved: false,
    }),
    [products]
  );

  const handleSubmit = (values: ReviewFormValues) => {
    mutate(values);
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/reviews">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva reseña</h1>
          <p className="text-muted-foreground">
            Crea reseñas manualmente para validar el contenido
          </p>
        </div>
      </div>

      {products.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay productos disponibles</AlertTitle>
          <AlertDescription>
            Debes crear productos antes de registrar reseñas.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información de la reseña</CardTitle>
          <CardDescription>Asigna producto, autor y contenido</CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            users={users}
            products={products}
            isSubmitting={isPending}
            submitLabel="Crear reseña"
          />
        </CardContent>
      </Card>
    </div>
  );
}
