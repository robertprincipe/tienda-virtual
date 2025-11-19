"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Controller, Resolver, useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";

import { Checkbox } from "@/components/ui/checkbox";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { couponsTypes } from "@/drizzle/schema";
import type { SelectCategory } from "@/schemas/category.schema";
import {
  couponFormSchema,
  type CouponFormValues,
  type CouponWithRelations,
} from "@/schemas/coupon.schema";
import { useUpdateCoupon } from "@/services/coupons/mutations/coupon.mutation";

interface EditCouponPageProps {
  coupon: CouponWithRelations;
  categories: SelectCategory[];
  products: Array<{
    id: number;
    name: string;
    sku?: string | null;
  }>;
}

const dateInputValue = (value?: Date | string | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export default function EditCouponPage({
  coupon,
  categories,
  products,
}: EditCouponPageProps) {
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(
      couponFormSchema
    ) as unknown as Resolver<CouponFormValues>,
    defaultValues: {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value ?? 0),
      minSubtotal: coupon.minSubtotal ? Number(coupon.minSubtotal) : undefined,
      maxUses: coupon.maxUses ?? undefined,
      maxUsesPerUser: coupon.maxUsesPerUser ?? undefined,
      startsAt: coupon.startsAt ? new Date(coupon.startsAt) : undefined,
      endsAt: coupon.endsAt ? new Date(coupon.endsAt) : undefined,
      isActive: coupon.isActive,
      productIds: coupon.products.map((product) => product.id),
      categoryIds: coupon.categories.map((category) => category.id),
    },
  });

  const { mutate, isPending } = useUpdateCoupon();

  const numberChangeHandler =
    (field: { onChange: (value: number | undefined) => void }) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      field.onChange(value === "" ? undefined : Number(value));
    };

  const toggleIdInArray = (
    current: number[] | undefined,
    id: number,
    checked: boolean
  ) => {
    const next = new Set(current ?? []);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    return Array.from(next);
  };

  const onSubmit = (values: z.infer<typeof couponFormSchema>) => {
    mutate({ ...values, id: coupon.id });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar cupón</h1>
          <p className="text-muted-foreground">
            Actualiza los detalles de {coupon.code}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del cupón</CardTitle>
          <CardDescription>Modifica los campos necesarios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="code"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-code">Código</FieldLabel>
                      <Input
                        {...field}
                        id="coupon-code"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-type">
                        Tipo de descuento
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="coupon-type"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {couponsTypes.enumValues.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === "percent" ? "Porcentaje" : "Monto fijo"}
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

              <div className="grid gap-4 md:grid-cols-3">
                <Controller
                  name="value"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-value">Valor</FieldLabel>
                      <Input
                        {...field}
                        id="coupon-value"
                        type="number"
                        step="0.1"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="minSubtotal"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-min-subtotal">
                        Subtotal mínimo
                      </FieldLabel>
                      <Input
                        {...field}
                        id="coupon-min-subtotal"
                        type="number"
                        step="0.1"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Activo</FieldLabel>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <p className="text-sm text-muted-foreground">
                          Habilita o deshabilita el cupón
                        </p>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="maxUses"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-max-uses">
                        Máximo de usos
                      </FieldLabel>
                      <Input
                        {...field}
                        id="coupon-max-uses"
                        type="number"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="maxUsesPerUser"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-max-user">
                        Usos por cliente
                      </FieldLabel>
                      <Input
                        {...field}
                        id="coupon-max-user"
                        type="number"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="startsAt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-starts">
                        Fecha de inicio
                      </FieldLabel>
                      <Input
                        id="coupon-starts"
                        type="date"
                        value={dateInputValue(field.value)}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value
                              ? new Date(event.target.value)
                              : undefined
                          )
                        }
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="endsAt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="coupon-ends">
                        Fecha de término
                      </FieldLabel>
                      <Input
                        id="coupon-ends"
                        type="date"
                        value={dateInputValue(field.value)}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value
                              ? new Date(event.target.value)
                              : undefined
                          )
                        }
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Controller
                  name="productIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Productos aplicables</FieldLabel>
                      <div className="rounded-md border p-3">
                        {products.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No hay productos disponibles.
                          </p>
                        ) : (
                          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
                            {products.map((product) => (
                              <label
                                key={product.id}
                                htmlFor={`product-${product.id}`}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Checkbox
                                  id={`product-${product.id}`}
                                  checked={
                                    field.value?.includes(product.id) ?? false
                                  }
                                  onCheckedChange={(checked) =>
                                    field.onChange(
                                      toggleIdInArray(
                                        field.value,
                                        product.id,
                                        Boolean(checked)
                                      )
                                    )
                                  }
                                />
                                <span>
                                  {product.name}
                                  {product.sku && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      SKU: {product.sku}
                                    </span>
                                  )}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="categoryIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Categorías aplicables</FieldLabel>
                      <div className="rounded-md border p-3">
                        {categories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No hay categorías disponibles.
                          </p>
                        ) : (
                          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
                            {categories.map((category) => (
                              <label
                                key={category.id}
                                htmlFor={`category-${category.id}`}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={
                                    field.value?.includes(category.id) ?? false
                                  }
                                  onCheckedChange={(checked) =>
                                    field.onChange(
                                      toggleIdInArray(
                                        field.value,
                                        category.id,
                                        Boolean(checked)
                                      )
                                    )
                                  }
                                />
                                <span>{category.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/coupons">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Actualizando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
