"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Package, Eye } from "lucide-react";
import Link from "next/link";
import type { SessionUser } from "@/types/auth";
import type { OrderListItem } from "@/schemas/order.schema";

interface AccountClientProps {
  user: SessionUser;
  orders: OrderListItem[];
}

export default function AccountClient({ user, orders }: AccountClientProps) {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="orders">
            Mis Pedidos {orders.length > 0 && `(${orders.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Información Personal</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/account/edit">
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar perfil
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre
                </label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Rol
                </label>
                <p className="text-lg">
                  {user.roleId === 1
                    ? "Administrador"
                    : user.roleId === 2
                    ? "Vendedor"
                    : "Cliente"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aún no tienes pedidos realizados.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/products">Explorar productos</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-lg">
                              {order.publicId}
                            </p>
                            <Badge
                              variant={
                                order.status === "delivered"
                                  ? "default"
                                  : order.status === "shipped"
                                  ? "secondary"
                                  : order.status === "canceled"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {order.status === "created" && "Creado"}
                              {order.status === "processing" && "Procesando"}
                              {order.status === "shipped" && "Enviado"}
                              {order.status === "delivered" && "Entregado"}
                              {order.status === "canceled" && "Cancelado"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Fecha:{" "}
                            {new Date(
                              order.placedAt || order.createdAt
                            ).toLocaleDateString("es-PE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.itemsCount}{" "}
                            {order.itemsCount === 1 ? "producto" : "productos"}
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2">
                          <p className="text-2xl font-bold text-primary">
                            S/. {parseFloat(order.total).toFixed(2)}
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/order/${order.publicId}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
