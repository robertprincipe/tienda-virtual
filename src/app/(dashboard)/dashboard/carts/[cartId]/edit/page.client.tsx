"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { CartForm } from "@/components/carts/cart-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CartFormValues, CartWithRelations } from "@/schemas/cart.schema";
import { useUpdateCart } from "@/services/carts/mutations/cart.mutation";

interface EditCartPageProps {
  cart: CartWithRelations;
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{ id: number; name: string; sku?: string | null }>;
}

export default function EditCartPage({
  cart,
  users,
  products,
}: EditCartPageProps) {
  const { mutate, isPending } = useUpdateCart();

  const defaultValues = useMemo<CartFormValues>(
    () => ({
      userId: cart.userId ?? undefined,
      status: cart.status,
      expiresAt: cart.expiresAt ? new Date(cart.expiresAt) : undefined,
      items:
        cart.items.length > 0
          ? cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            }))
          : products.length > 0
            ? [{ productId: products[0].id, quantity: 1 }]
            : [],
    }),
    [cart, products]
  );

  const handleSubmit = (values: CartFormValues) => {
    mutate({ ...values, id: cart.id });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/carts/${cart.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar carrito #{cart.id}
          </h1>
          <p className="text-muted-foreground">
            Actualiza los datos del cliente o los productos del carrito
          </p>
        </div>
      </div>

      {products.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay productos disponibles</AlertTitle>
          <AlertDescription>
            Crea al menos un producto antes de actualizar el carrito para
            evitar inconsistencias.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del carrito</CardTitle>
          <CardDescription>
            Modifica el propietario, estado o productos incluidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CartForm
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
