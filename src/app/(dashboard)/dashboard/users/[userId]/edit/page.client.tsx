"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { UserForm } from "@/components/users/user-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserFormValues, UserListItem } from "@/schemas/admin-user.schema";
import { useUpdateUser } from "@/services/users/mutations/admin-user.mutation";

interface EditUserPageProps {
  user: UserListItem;
  roles: Array<{ id: number; name: string }>;
}

export default function EditUserPage({ user, roles }: EditUserPageProps) {
  const { mutate, isPending } = useUpdateUser();

  const defaultValues = useMemo<UserFormValues>(
    () => ({
      id: user.id,
      roleId: user.roleId,
      name: user.name,
      paternalLastName: user.paternalLastName ?? "",
      maternalLastName: user.maternalLastName ?? "",
      photoUrl: user.photoUrl ?? "",
      line1: user.line1 ?? "",
      line2: user.line2 ?? "",
      city: user.city ?? "",
      region: user.region ?? "",
      phone: user.phone ?? "",
      email: user.email,
      password: "",
    }),
    [user]
  );

  const handleSubmit = (values: UserFormValues) => {
    mutate({ ...values, id: user.id });
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/users/${user.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar usuario {user.email}
          </h1>
          <p className="text-muted-foreground">
            Actualiza los datos personales o su rol de acceso
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del usuario</CardTitle>
          <CardDescription>
            Los campos en blanco no modificarán la contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            roles={roles}
            isSubmitting={isPending}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  );
}
