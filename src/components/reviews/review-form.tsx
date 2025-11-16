"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  reviewFormSchema,
  type ReviewFormValues,
} from "@/schemas/product-review.schema";

interface ReviewFormProps {
  defaultValues: ReviewFormValues;
  onSubmit: (values: ReviewFormValues) => void;
  products: Array<{ id: number; name: string; sku?: string | null }>;
  users: Array<{ id: number; name: string | null; email: string | null }>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ReviewForm({
  defaultValues,
  onSubmit,
  products,
  users,
  isSubmitting,
  submitLabel = "Guardar reseña",
}: ReviewFormProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(
      reviewFormSchema
    ) as unknown as Resolver<ReviewFormValues>,
    defaultValues,
  });

  const numberInputHandler =
    (field: { onChange: (value: number | undefined) => void }) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange(
        event.target.value === "" ? undefined : Number(event.target.value)
      );
    };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="productId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="review-product">Producto</FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : undefined)
                  }
                >
                  <SelectTrigger
                    id="review-product"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        <span>{product.name}</span>
                        {product.sku && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="userId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="review-user">Cliente</FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : undefined)
                  }
                >
                  <SelectTrigger
                    id="review-user"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Invitado" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name ?? "Sin nombre"}
                        {user.email && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="rating"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="review-rating">
                  Calificación (0 - 9.9)
                </FieldLabel>
                <Input
                  id="review-rating"
                  type="number"
                  step="0.1"
                  min={0}
                  max={9.9}
                  value={field.value ?? ""}
                  onChange={numberInputHandler(field)}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="isApproved"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Status</FieldLabel>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Aprobar reseña</p>
                    <p className="text-xs text-muted-foreground">
                      {field.value
                        ? "Visible en la tienda"
                        : "Pendiente de aprobación"}
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="review-title">Título (opcional)</FieldLabel>
              <Input
                {...field}
                id="review-title"
                placeholder="Gran producto"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="body"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="review-body">Contenido</FieldLabel>
              <Textarea
                {...field}
                id="review-body"
                rows={5}
                placeholder="Comparte detalles adicionales de la experiencia"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
