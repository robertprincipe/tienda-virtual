"use client";

import { useMemo } from "react";
import {
  Controller,
  Resolver,
  useFieldArray,
  useForm,
} from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cartsStatuses } from "@/drizzle/schema";
import {
  cartFormSchema,
  type CartFormValues,
  type CartItemFormValues,
} from "@/schemas/cart.schema";

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

interface CartFormProps {
  defaultValues: CartFormValues;
  onSubmit: (values: CartFormValues) => void;
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{ id: number; name: string; sku?: string | null }>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function CartForm({
  defaultValues,
  onSubmit,
  users,
  products,
  isSubmitting,
  submitLabel = "Guardar carrito",
}: CartFormProps) {
  const form = useForm<CartFormValues>({
    resolver: zodResolver(
      cartFormSchema
    ) as unknown as Resolver<CartFormValues>,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const watchedItems = form.watch("items");
  const totals = useMemo(() => {
    const totalQuantity = watchedItems?.reduce(
      (acc, item) => acc + (item?.quantity ?? 0),
      0
    );

    return {
      lines: watchedItems?.length ?? 0,
      quantity: totalQuantity ?? 0,
    };
  }, [watchedItems]);

  const addItem = () => {
    if (products.length === 0) {
      return;
    }

    append({
      productId: products[0]?.id ?? 0,
      quantity: 1,
    } as CartItemFormValues);
  };

  const handleSubmit = (values: CartFormValues) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="userId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cart-user">Cliente asociado</FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : undefined)
                  }
                >
                  <SelectTrigger
                    id="cart-user"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Carrito anónimo</SelectItem>
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
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="cart-status">Estado</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="cart-status"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {cartsStatuses.enumValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "active"
                          ? "Activo"
                          : status === "converted"
                            ? "Convertido"
                            : "Abandonado"}
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

        <Controller
          name="expiresAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="cart-expiration">Expira el</FieldLabel>
              <Input
                id="cart-expiration"
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

      </FieldGroup>

      <FieldGroup>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium">Productos del carrito</h3>
            <p className="text-sm text-muted-foreground">
              {totals.lines} línea(s) • {totals.quantity} unidad(es)
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addItem}
            disabled={products.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Agregar producto
          </Button>
        </div>

        {form.formState.errors.items?.root?.message && (
          <p className="text-sm text-destructive">
            {form.formState.errors.items.root.message}
          </p>
        )}

        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Agrega productos para construir el carrito.
            </div>
          ) : (
            fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="grid gap-4 rounded-lg border p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
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
                          field.onChange(value ? Number(value) : undefined)
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
                        min={1}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value)
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
                <div className="flex items-end justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Quitar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
