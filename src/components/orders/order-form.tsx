"use client";

import { useMemo } from "react";
import { Controller, Resolver, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import {
  orderFormSchema,
  type OrderFormValues,
  type OrderItemFormValues,
} from "@/schemas/order.schema";
import { orderStatusEnum } from "@/drizzle/schema";

const dateTimeInputValue = (value?: Date | string | null) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

interface OrderFormProps {
  defaultValues: OrderFormValues;
  onSubmit: (values: OrderFormValues) => void;
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{
    id: number;
    name: string;
    sku?: string | null;
    price?: string | null;
  }>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function OrderForm({
  defaultValues,
  onSubmit,
  users,
  products,
  isSubmitting,
  submitLabel = "Guardar pedido",
}: OrderFormProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(
      orderFormSchema
    ) as unknown as Resolver<OrderFormValues>,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount");
  const watchedTax = form.watch("tax");
  const watchedShipping = form.watch("shipping");

  const totals = useMemo(() => {
    const subtotal =
      watchedItems?.reduce((acc, item) => {
        const quantity = item?.quantity ?? 0;
        const price = item?.unitPrice ?? 0;
        return acc + price * quantity;
      }, 0) ?? 0;

    const discount = watchedDiscount ?? 0;
    const tax = watchedTax ?? 0;
    const shipping = watchedShipping ?? 0;
    const total = Math.max(0, subtotal - discount + tax + shipping);

    return {
      subtotal,
      discount,
      tax,
      shipping,
      total,
    };
  }, [watchedItems, watchedDiscount, watchedTax, watchedShipping]);

  const handleAddItem = () => {
    if (products.length === 0) {
      return;
    }

    const first = products[0];
    append({
      productId: first.id,
      quantity: 1,
      unitPrice: Number(first.price ?? 0),
    } as OrderItemFormValues);
  };

  const handleProductChange = (index: number, productId: number) => {
    const product = products.find((item) => item.id === productId);
    form.setValue(`items.${index}.productId`, productId);
    if (product?.price) {
      form.setValue(`items.${index}.unitPrice`, Number(product.price));
    }
  };

  const handleSubmit = (values: OrderFormValues) => {
    onSubmit(values);
  };

  const numberInputHandler =
    (field: { onChange: (value: number | undefined) => void }) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange(
        event.target.value === "" ? undefined : Number(event.target.value)
      );
    };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="userId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-user">Cliente</FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => {
                    const parsed = value ? Number(value) : undefined;
                    field.onChange(parsed);
                    if (parsed) {
                      const user = users.find((item) => item.id === parsed);
                      if (user?.email) {
                        form.setValue("email", user.email);
                      }
                    }
                  }}
                >
                  <SelectTrigger
                    id="order-user"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Carrito anónimo (asignar)" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name ?? "Sin nombre"}
                        {user.email && (
                          <span className="text-muted-foreground ml-2 text-xs">
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
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-email">Correo</FieldLabel>
                <Input
                  {...field}
                  id="order-email"
                  type="email"
                  placeholder="cliente@correo.com"
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
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-status">Estado</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="order-status"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusEnum.enumValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
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
            name="couponCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-coupon">Cupón</FieldLabel>
                <Input
                  {...field}
                  id="order-coupon"
                  placeholder="PROMO10"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <FieldGroup>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium">Productos</h3>
            <p className="text-sm text-muted-foreground">
              Administra los artículos del pedido
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddItem}
            disabled={products.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar producto
          </Button>
        </div>

        {(form.formState.errors.items as { root?: { message?: string } })?.root
          ?.message && (
          <p className="text-sm text-destructive">
            {form.formState.errors.items?.root?.message}
          </p>
        )}

        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Agrega productos para construir el pedido.
            </div>
          ) : (
            fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="grid gap-4 rounded-lg border p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <Controller
                  name={`items.${index}.productId`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Producto</FieldLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(value) =>
                          handleProductChange(index, Number(value))
                        }
                        disabled={products.length === 0}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Selecciona un producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={String(product.id)}
                            >
                              <div className="flex flex-col">
                                <span>{product.name}</span>
                                {product.sku && (
                                  <span className="text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                  </span>
                                )}
                              </div>
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
                  name={`items.${index}.quantity`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Cantidad</FieldLabel>
                      <Input
                        type="number"
                        min={0.01}
                        step="0.01"
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
                  name={`items.${index}.unitPrice`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Precio unitario</FieldLabel>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
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
                <div className="flex flex-col items-end justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-base font-semibold">
                    {new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                      minimumFractionDigits: 2,
                    }).format(
                      (watchedItems?.[index]?.unitPrice ?? 0) *
                        (watchedItems?.[index]?.quantity ?? 0)
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Quitar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </FieldGroup>

      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="discount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-discount">Descuento</FieldLabel>
                <Input
                  id="order-discount"
                  type="number"
                  step="0.01"
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
            name="tax"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-tax">Impuestos</FieldLabel>
                <Input
                  id="order-tax"
                  type="number"
                  step="0.01"
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
            name="shipping"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-shipping">Envío</FieldLabel>
                <Input
                  id="order-shipping"
                  type="number"
                  step="0.01"
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
        </div>
        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Resumen del pedido
          </h4>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <dt>Subtotal</dt>
              <dd>
                {totals.subtotal.toLocaleString("es-PE", {
                  style: "currency",
                  currency: "PEN",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Descuento</dt>
              <dd>
                -
                {totals.discount.toLocaleString("es-PE", {
                  style: "currency",
                  currency: "PEN",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Impuestos</dt>
              <dd>
                {totals.tax.toLocaleString("es-PE", {
                  style: "currency",
                  currency: "PEN",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Envío</dt>
              <dd>
                {totals.shipping.toLocaleString("es-PE", {
                  style: "currency",
                  currency: "PEN",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>
                {totals.total.toLocaleString("es-PE", {
                  style: "currency",
                  currency: "PEN",
                })}
              </dd>
            </div>
          </dl>
        </div>
      </FieldGroup>

      <FieldGroup>
        <h3 className="text-lg font-medium">Dirección de envío</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-fullname">
                  Nombre completo
                </FieldLabel>
                <Input
                  {...field}
                  id="order-fullname"
                  placeholder="Juan Pérez"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-phone">Teléfono</FieldLabel>
                <Input
                  {...field}
                  id="order-phone"
                  placeholder="+51 999 999 999"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <div className="grid gap-4">
          <Controller
            name="line1"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-line1">Dirección</FieldLabel>
                <Input
                  {...field}
                  id="order-line1"
                  placeholder="Av. Siempre Viva 742"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="line2"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-line2">
                  Departamento (opcional)
                </FieldLabel>
                <Input
                  {...field}
                  id="order-line2"
                  placeholder="Depto 101"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-city">Ciudad</FieldLabel>
                <Input
                  {...field}
                  id="order-city"
                  placeholder="Lima"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="region"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-region">Región</FieldLabel>
                <Input
                  {...field}
                  id="order-region"
                  placeholder="Lima"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="postalCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-postal">Código postal</FieldLabel>
                <Input
                  {...field}
                  id="order-postal"
                  placeholder="15000"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <Controller
          name="countryCode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order-country">País (ISO 2)</FieldLabel>
              <Input
                {...field}
                id="order-country"
                placeholder="PE"
                maxLength={2}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <h3 className="text-lg font-medium">Detalles de envío</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="shippingMethodName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-shipping-method">Método</FieldLabel>
                <Input
                  {...field}
                  id="order-shipping-method"
                  placeholder="Entrega express"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="shippingCarrier"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-carrier">Transportista</FieldLabel>
                <Input
                  {...field}
                  id="order-carrier"
                  placeholder="DHL"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
        <Controller
          name="shippingTrackingNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order-tracking">
                Número de seguimiento
              </FieldLabel>
              <Input
                {...field}
                id="order-tracking"
                placeholder="TRACK123"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <h3 className="text-lg font-medium">Fechas importantes</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="placedAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-placed">Creada</FieldLabel>
                <Input
                  id="order-placed"
                  type="datetime-local"
                  value={dateTimeInputValue(field.value)}
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
            name="shippedAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-shipped">Enviada</FieldLabel>
                <Input
                  id="order-shipped"
                  type="datetime-local"
                  value={dateTimeInputValue(field.value)}
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
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="deliveredAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-delivered">Entregada</FieldLabel>
                <Input
                  id="order-delivered"
                  type="datetime-local"
                  value={dateTimeInputValue(field.value)}
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
            name="canceledAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="order-canceled">Cancelada</FieldLabel>
                <Input
                  id="order-canceled"
                  type="datetime-local"
                  value={dateTimeInputValue(field.value)}
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
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order-notes">Notas internas</FieldLabel>
              <Textarea
                {...field}
                id="order-notes"
                rows={4}
                placeholder="Observaciones adicionales"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Label className="text-xs text-muted-foreground">
          Esta información solo es visible para el equipo interno.
        </Label>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
