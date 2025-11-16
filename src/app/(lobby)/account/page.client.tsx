"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import type { SessionUser } from "@/types/auth";

interface AccountClientProps {
  user: SessionUser;
}

export default function AccountClient({ user }: AccountClientProps) {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="orders">Mis Pedidos</TabsTrigger>
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
              <p className="text-muted-foreground">
                Aún no tienes pedidos realizados.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
