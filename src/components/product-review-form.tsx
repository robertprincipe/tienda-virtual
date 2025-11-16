"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  createReviewSchema,
  type CreateReviewInput,
} from "@/schemas/review.schema";
import { useCreateReview } from "@/services/reviews/mutations/review.mutation";
import { cn } from "@/lib/utils";

interface ProductReviewFormProps {
  productId: number;
}

export function ProductReviewForm({ productId }: ProductReviewFormProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema) as Resolver<CreateReviewInput>,
    defaultValues: {
      productId,
      rating: 0,
      title: "",
      body: "",
    },
  });

  const { mutate, isPending } = useCreateReview();

  const [selectedRating, setSelectedRating] = useState(0);

  const onSubmit = (values: CreateReviewInput) => {
    if (selectedRating === 0) {
      form.setError("rating", {
        message: "Por favor selecciona una calificación",
      });
      return;
    }
    mutate({ ...values, rating: selectedRating });
  };

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
    form.clearErrors("rating");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deja tu reseña</CardTitle>
        <CardDescription>
          Comparte tu opinión sobre este producto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* Star Rating */}
            <Field>
              <FieldLabel>
                Calificación <span className="text-destructive">*</span>
              </FieldLabel>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        (hoveredRating || selectedRating) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {selectedRating > 0 ? `${selectedRating} estrellas` : ""}
                </span>
              </div>
              {form.formState.errors.rating && (
                <FieldError>{form.formState.errors.rating.message}</FieldError>
              )}
            </Field>

            {/* Title */}
            <Field>
              <FieldLabel htmlFor="title">Título (opcional)</FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="Resume tu experiencia"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <FieldError>{form.formState.errors.title.message}</FieldError>
              )}
            </Field>

            {/* Body */}
            <Field>
              <FieldLabel htmlFor="body">Reseña (opcional)</FieldLabel>
              <Textarea
                id="body"
                placeholder="Cuéntanos más sobre tu experiencia con este producto..."
                rows={4}
                {...form.register("body")}
              />
              {form.formState.errors.body && (
                <FieldError>{form.formState.errors.body.message}</FieldError>
              )}
            </Field>
          </FieldGroup>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Enviando..." : "Enviar reseña"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
