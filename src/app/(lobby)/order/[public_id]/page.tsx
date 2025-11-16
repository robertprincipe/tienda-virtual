import { getOrderByPublicId } from "@/services/orders/actions/order.actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface Props {
  params: Promise<{
    public_id: string;
  }>;
}

const statusConfig = {
  created: {
    label: "Creada",
    color: "bg-slate-500",
    icon: Clock,
  },
  paid: {
    label: "Pagada",
    color: "bg-blue-500",
    icon: CreditCard,
  },
  processing: {
    label: "Procesando",
    color: "bg-yellow-500",
    icon: Package,
  },
  shipped: {
    label: "Enviada",
    color: "bg-purple-500",
    icon: Truck,
  },
  delivered: {
    label: "Entregada",
    color: "bg-green-500",
    icon: CheckCircle2,
  },
  canceled: {
    label: "Cancelada",
    color: "bg-red-500",
    icon: XCircle,
  },
  refunded: {
    label: "Reembolsada",
    color: "bg-orange-500",
    icon: XCircle,
  },
};

export default async function OrderTrackingPage(props: Props) {
  const params = await props.params;
  const result = await getOrderByPublicId(params.public_id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;
  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Seguimiento de Orden</h1>
        <p className="text-muted-foreground">Orden #{order.publicId}</p>
      </div>

      {/* Estado */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="w-5 h-5" />
            Estado del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className={`${status.color} text-white px-4 py-2 text-base`}>
              {status.label}
            </Badge>
            <div className="text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 inline mr-1" />
              Creada:{" "}
              {new Date(order.placedAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700" />
            <div
              className={`absolute top-4 left-0 h-1 ${status.color} transition-all duration-500`}
              style={{
                width: {
                  created: "0%",
                  paid: "25%",
                  processing: "50%",
                  shipped: "75%",
                  delivered: "100%",
                  canceled: "0%",
                  refunded: "0%",
                }[order.status],
              }}
            />

            {["created", "paid", "processing", "shipped", "delivered"].map(
              (s, i) => {
                const isActive =
                  [
                    "created",
                    "paid",
                    "processing",
                    "shipped",
                    "delivered",
                  ].indexOf(order.status) >= i;
                const config = statusConfig[s as keyof typeof statusConfig];
                const Icon = config.icon;

                return (
                  <div
                    key={s}
                    className="relative flex flex-col items-center z-10"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs mt-2 text-center">
                      {config.label}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          {/* Tracking info */}
          {order.shippingTrackingNumber && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4" />
                <span className="font-medium">Número de Seguimiento</span>
              </div>
              <p className="text-lg font-mono">
                {order.shippingTrackingNumber}
              </p>
              {order.shippingCarrier && (
                <p className="text-sm text-muted-foreground mt-1">
                  Transportista: {order.shippingCarrier}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {item.product?.name || "Producto eliminado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.unitPrice}</p>
                  <p className="text-sm text-muted-foreground">
                    Subtotal: $
                    {(
                      parseFloat(item.unitPrice) * parseFloat(item.quantity)
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totales */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>
                  Descuento {order.couponCode && `(${order.couponCode})`}
                </span>
                <span>-${order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Envío</span>
              <span>${order.shipping}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuestos</span>
              <span>${order.tax}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${order.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección de envío */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección de Envío
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium">{order.fullName}</p>
            <p>{order.line1}</p>
            {order.line2 && <p>{order.line2}</p>}
            <p>
              {order.city}
              {order.region && `, ${order.region}`}
            </p>
            {order.postalCode && <p>{order.postalCode}</p>}
            <p>{order.countryCode}</p>
            {order.phone && <p>Tel: {order.phone}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {order.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
