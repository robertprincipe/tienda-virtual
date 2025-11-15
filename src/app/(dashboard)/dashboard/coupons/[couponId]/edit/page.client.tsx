"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import type { Category } from "@/schemas/category.schema";
import {
  couponFormSchema,
  type CouponFormValues,
  type CouponWithRelations,
} from "@/schemas/coupon.schema";
import { useUpdateCoupon } from "@/services/coupons/mutations/coupon.mutation";

interface EditCouponPageProps {
  coupon: CouponWithRelations;
  categories: Category[];
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
    resolver: zodResolver(couponFormSchema),
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

  const onSubmit = (values: z.infer<typeof couponFormSchema>) => {
    mutate({ ...values, id: coupon.id });
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
          <p className="text-muted-foreground">Actualiza los detalles de {coupon.code}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del cupón</CardTitle>
          <CardDescription>Modifica los campos necesarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de descuento</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {couponsTypes.enumValues.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === "percent" ? "Porcentaje" : "Monto fijo"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minSubtotal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtotal mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Activo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Habilita o deshabilita el cupón
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de usos</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxUsesPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usos por cliente</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={dateInputValue(field.value)}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value
                                ? new Date(event.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de término</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={dateInputValue(field.value)}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value
                                ? new Date(event.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="productIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Productos aplicables</FormLabel>
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
                                  checked={field.value?.includes(product.id) ?? false}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorías aplicables</FormLabel>
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
                                  checked={field.value?.includes(category.id) ?? false}
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/coupons">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Actualizando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
