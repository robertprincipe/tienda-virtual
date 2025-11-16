"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Edit, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useDeleteOrder } from "@/services/orders/mutations/order.mutation";
import { useOrder } from "@/services/orders/queries/order.query";
import { parseIntSafety } from "@/lib/utils";

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "S/. 0.00";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return "S/. 0.00";
  }

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(numericValue);
};

const formatDateTime = (value?: Date | string | null) => {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusCopy: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  created: { label: "Creada", variant: "secondary" },
  paid: { label: "Pagada", variant: "default" },
  processing: { label: "Procesando", variant: "default" },
  shipped: { label: "Enviada", variant: "default" },
  delivered: { label: "Entregada", variant: "default" },
  canceled: { label: "Cancelada", variant: "outline" },
  refunded: { label: "Reembolsada", variant: "outline" },
};

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = parseIntSafety(params.orderId);

  const { data: order, isLoading } = useOrder(orderId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate, isPending } = useDeleteOrder();

  const totals = useMemo(() => {
    if (!order) {
      return {
        subtotal: "S/. 0.00",
        discount: "S/. 0.00",
        tax: "S/. 0.00",
        shipping: "S/. 0.00",
        total: "S/. 0.00",
      };
    }
    return {
      subtotal: formatCurrency(order.subtotal),
      discount: formatCurrency(order.discount),
      tax: formatCurrency(order.tax),
      shipping: formatCurrency(order.shipping),
      total: formatCurrency(order.total),
    };
  }, [order]);

  if (isLoading) {
    return <div className="p-6">Cargando pedido...</div>;
  }

  if (!order) {
    notFound();
  }

  const status = statusCopy[order.status] ?? statusCopy.created;

  const handleDelete = () => {
    mutate(order.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
      },
    });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Pedido {order.publicId}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Creado el {formatDateTime(order.placedAt as Date | string)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/orders/${order.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>Detalle de artículos incluidos</CardDescription>
          </CardHeader>
          <CardContent>
            {order.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este pedido no tiene artículos registrados.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.product ? (
                          <Link
                            href={`/dashboard/products/${item.product.id}`}
                            className="font-medium hover:underline"
                          >
                            {item.product.name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">
                            Producto eliminado
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(item.quantity ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          Number(item.unitPrice ?? 0) *
                            Number(item.quantity ?? 0)
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>Montos totales del pedido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{totals.subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Descuento</span>
                <span>-{totals.discount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span>{totals.tax}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>{totals.shipping}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{totals.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
              <CardDescription>Comentarios adicionales</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {order.notes?.trim() ? order.notes : "Sin notas registradas."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del cliente</CardTitle>
            <CardDescription>
              Datos proporcionados en el checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Nombre y correo</p>
              <p className="font-medium">{order.fullName}</p>
              <p>{order.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p>{order.phone ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dirección</p>
              <p>
                {order.line1}
                {order.line2 ? `, ${order.line2}` : ""}
              </p>
              <p>
                {order.city}, {order.region ?? "-"} {order.postalCode ?? ""}
              </p>
              <p>{order.countryCode}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seguimiento de envío</CardTitle>
            <CardDescription>Estado logístico del pedido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {order.shippingMethodName ?? "Método no especificado"}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingCarrier ?? "Transportista sin definir"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground">Tracking</p>
              <p>{order.shippingTrackingNumber ?? "Sin número"}</p>
            </div>
            <div className="grid gap-2">
              <p className="text-muted-foreground">
                Enviada: {formatDateTime(order.shippedAt as Date | string)}
              </p>
              <p className="text-muted-foreground">
                Entregada: {formatDateTime(order.deliveredAt as Date | string)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar pedido?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el pedido {order.publicId}. Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
