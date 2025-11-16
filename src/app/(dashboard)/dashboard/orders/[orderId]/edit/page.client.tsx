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
import type { OrderFormValues, OrderWithRelations } from "@/schemas/order.schema";
import { useUpdateOrder } from "@/services/orders/mutations/order.mutation";

interface EditOrderPageProps {
  order: OrderWithRelations;
  users: Array<{ id: number; name: string | null; email: string | null }>;
  products: Array<{ id: number; name: string; sku?: string | null; price?: string | null }>;
}

export default function EditOrderPage({ order, users, products }: EditOrderPageProps) {
  const { mutate, isPending } = useUpdateOrder();

  const defaultValues = useMemo<OrderFormValues>(
    () => {
      const fallbackProductId = products[0]?.id ?? 0;
      const mappedItems =
        order.items.length > 0
          ? order.items
              .map((item) => ({
                productId: item.productId ?? fallbackProductId,
                quantity: Number(item.quantity ?? 0),
                unitPrice: Number(item.unitPrice ?? 0),
              }))
              .filter((item) => item.productId > 0)
          : [];

      return {
        userId: order.userId ?? undefined,
        email: order.email,
        status: order.status,
        discount: Number(order.discount ?? 0),
        tax: Number(order.tax ?? 0),
      shipping: Number(order.shipping ?? 0),
      couponCode: order.couponCode ?? undefined,
      notes: order.notes ?? "",
      fullName: order.fullName,
      line1: order.line1,
      line2: order.line2 ?? "",
      city: order.city,
      region: order.region ?? "",
      postalCode: order.postalCode ?? "",
      countryCode: order.countryCode,
      phone: order.phone ?? "",
      shippingMethodName: order.shippingMethodName ?? "",
      shippingCarrier: order.shippingCarrier ?? "",
      shippingTrackingNumber: order.shippingTrackingNumber ?? "",
      placedAt: order.placedAt ? new Date(order.placedAt) : new Date(),
      shippedAt: order.shippedAt ? new Date(order.shippedAt) : undefined,
      deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
      canceledAt: order.canceledAt ? new Date(order.canceledAt) : undefined,
        items:
          mappedItems.length > 0
            ? mappedItems
            : products.length > 0
              ? [
                  {
                    productId: products[0].id,
                    quantity: 1,
                    unitPrice: Number(products[0].price ?? 0),
                  },
                ]
              : [],
      };
    },
    [order, products]
  );

  const handleSubmit = (values: OrderFormValues) => {
    mutate({ ...values, id: order.id });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/orders/${order.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar pedido {order.publicId}
          </h1>
          <p className="text-muted-foreground">
            Actualiza artículos, estado o datos de entrega
          </p>
        </div>
      </div>

      {products.length === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No hay productos disponibles</AlertTitle>
          <AlertDescription>
            Debes contar con al menos un producto para editar pedidos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del pedido</CardTitle>
          <CardDescription>Modifica los detalles necesarios</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm
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
