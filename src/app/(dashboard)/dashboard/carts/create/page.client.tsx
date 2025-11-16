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
import type { CartFormValues } from "@/schemas/cart.schema";
import { useCreateCart } from "@/services/carts/mutations/cart.mutation";

interface CreateCartPageProps {
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{ id: number; name: string; sku?: string | null }>;
}

export default function CreateCartPage({
  users,
  products,
}: CreateCartPageProps) {
  const { mutate, isPending } = useCreateCart();

  const defaultValues = useMemo<CartFormValues>(
    () => ({
      userId: undefined,
      status: "active",
      expiresAt: undefined,
      items:
        products.length > 0
          ? [{ productId: products[0].id, quantity: 1 }]
          : [],
    }),
    [products]
  );

  const handleSubmit = (values: CartFormValues) => {
    mutate(values);
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/carts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo carrito</h1>
          <p className="text-muted-foreground">
            Define al cliente y los productos que formarán parte del carrito
          </p>
        </div>
      </div>

      {products.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay productos disponibles</AlertTitle>
          <AlertDescription>
            Crea al menos un producto antes de registrar un carrito. Sin un
            producto no es posible completar el proceso.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del carrito</CardTitle>
          <CardDescription>
            Selecciona al cliente, estado y productos incluidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CartForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            users={users}
            products={products}
            isSubmitting={isPending}
            submitLabel="Crear carrito"
          />
        </CardContent>
      </Card>
    </div>
  );
}
