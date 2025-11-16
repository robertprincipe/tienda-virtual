"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { OrderForm } from "@/components/orders/order-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OrderFormValues } from "@/schemas/order.schema";
import { useCreateOrder } from "@/services/orders/mutations/order.mutation";

interface CreateOrderPageProps {
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{ id: number; name: string; sku?: string | null; price?: string | null }>;
}

export default function CreateOrderPage({ users, products }: CreateOrderPageProps) {
  const { mutate, isPending } = useCreateOrder();

  const defaultValues = useMemo<OrderFormValues>(
    () => ({
      userId: undefined,
      email: "",
      status: "created",
      discount: 0,
      tax: 0,
      shipping: 0,
      couponCode: undefined,
      notes: "",
      fullName: "",
      line1: "",
      line2: "",
      city: "",
      region: "",
      postalCode: "",
      countryCode: "PE",
      phone: "",
      shippingMethodName: "",
      shippingCarrier: "",
      shippingTrackingNumber: "",
      placedAt: new Date(),
      shippedAt: undefined,
      deliveredAt: undefined,
      canceledAt: undefined,
      items:
        products.length > 0
          ? [
              {
                productId: products[0].id,
                quantity: 1,
                unitPrice: Number(products[0].price ?? 0),
              },
            ]
          : [],
    }),
    [products]
  );

  const handleSubmit = (values: OrderFormValues) => {
    mutate(values);
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo pedido</h1>
          <p className="text-muted-foreground">
            Registra un pedido manual con los datos del cliente
          </p>
        </div>
      </div>

      {products.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay productos disponibles</AlertTitle>
          <AlertDescription>
            Debes contar con al menos un producto para poder crear pedidos manuales.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del pedido</CardTitle>
          <CardDescription>Completa los datos y agrega los artículos</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            users={users}
            products={products}
            isSubmitting={isPending}
            submitLabel="Crear pedido"
          />
        </CardContent>
      </Card>
    </div>
  );
}
