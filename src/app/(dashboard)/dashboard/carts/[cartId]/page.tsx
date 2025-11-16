"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Edit, ShoppingCart, Trash2 } from "lucide-react";
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
import { parseIntSafety } from "@/lib/utils";
import { useDeleteCart } from "@/services/carts/mutations/cart.mutation";
import { useCart } from "@/services/carts/queries/cart.query";

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
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
  {
    label: string;
    variant: "default" | "secondary" | "outline";
  }
> = {
  active: {
    label: "Activo",
    variant: "default",
  },
  converted: {
    label: "Convertido",
    variant: "secondary",
  },
  abandoned: {
    label: "Abandonado",
    variant: "outline",
  },
};

export default function CartDetailPage() {
  const params = useParams<{ cartId: string }>();
  const cartId = parseIntSafety(params.cartId);

  const { data: cart, isLoading } = useCart(cartId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate, isPending } = useDeleteCart();

  const totals = useMemo(() => {
    if (!cart) {
      return { quantity: 0, subtotal: 0 };
    }

    const quantity = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.items.reduce((acc, item) => {
      const price = item.product?.price ? Number(item.product.price) : 0;
      return acc + price * item.quantity;
    }, 0);

    return { quantity, subtotal };
  }, [cart]);

  if (isLoading) {
    return <div className="p-6">Cargando carrito...</div>;
  }

  if (!cart) {
    notFound();
    return null;
  }

  const status = statusCopy[cart.status] ?? statusCopy.active;

  const handleDelete = () => {
    if (!cart) {
      return;
    }
    mutate(cart.id, {
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
            <Link href="/dashboard/carts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Carrito #{cart.id}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Última actualización: {formatDateTime(cart.updatedAt as Date | string)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/carts/${cart.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <CardDescription>
              Detalle de los artículos agregados al carrito
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cart.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Este carrito no tiene productos registrados.
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
                  {cart.items.map((item) => (
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
                          <div className="text-muted-foreground">
                            Producto eliminado
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.product?.price ?? "0")}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          (item.product?.price
                            ? Number(item.product.price)
                            : 0) * item.quantity
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
              <CardTitle>Información general</CardTitle>
              <CardDescription>
                Datos del propietario y vigencia del carrito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Cliente</p>
                {cart.user ? (
                  <div>
                    <p className="font-medium">{cart.user.name ?? "Sin nombre"}</p>
                    <p className="text-muted-foreground">{cart.user.email}</p>
                  </div>
                ) : (
                  <p>Carrito anónimo</p>
                )}
              </div>
              <div>
                <p className="text-muted-foreground">Creado el</p>
                <p>{formatDateTime(cart.createdAt as Date | string)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expira el</p>
                <p>{formatDateTime(cart.expiresAt as Date | string)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Cantidad total e importe estimado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ítems</span>
                <span className="font-medium">{cart.items.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unidades</span>
                <span className="font-medium">{totals.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Subtotal estimado</span>
                <span className="font-semibold">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Estado del carrito</CardTitle>
              <CardDescription>
                Seguimiento del funnel y momento de actualización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span>{status.label}</span>
              </div>
              <div>
                <p className="text-muted-foreground">Actualizado el</p>
                <p>{formatDateTime(cart.updatedAt as Date | string)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar carrito?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el carrito y sus productos asociados. Esta
              acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
