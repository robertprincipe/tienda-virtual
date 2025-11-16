"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";

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
import { Separator } from "@/components/ui/separator";
import { parseIntSafety } from "@/lib/utils";
import { useDeleteUser } from "@/services/users/mutations/admin-user.mutation";
import { useAdminUser } from "@/services/users/queries/admin-user.query";

const formatDate = (value?: Date | string | null) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildFullName = (
  name?: string | null,
  paternal?: string | null,
  maternal?: string | null
) =>
  [name, paternal, maternal]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = parseIntSafety(params.userId);

  const { data: user, isLoading } = useAdminUser(userId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate, isPending } = useDeleteUser();

  if (isLoading) {
    return <div className="p-6">Cargando usuario...</div>;
  }

  if (!user) {
    notFound();
  }

  const handleDelete = () => {
    mutate(user.id, {
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
            <Link href="/dashboard/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {buildFullName(user.name, user.paternalLastName, user.maternalLastName) ||
                user.name}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/users/${user.id}/edit`}>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rol y estado</CardTitle>
            <CardDescription>Información de acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rol asignado</span>
              <Badge variant="outline">{user.role?.name ?? "Sin rol"}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Registrado</p>
              <p>{formatDate(user.createdAt as Date | string)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Última actualización</p>
              <p>{formatDate(user.updatedAt as Date | string)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
            <CardDescription>Datos de comunicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Teléfono</p>
              <p>{user.phone ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dirección</p>
              <p>{user.line1 ?? "-"}</p>
              {user.line2 && <p>{user.line2}</p>}
              <p>
                {[user.city, user.region].filter(Boolean).join(", ") || ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará al usuario "{user.email}".
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
