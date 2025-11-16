"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { UserForm } from "@/components/users/user-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UserFormValues } from "@/schemas/admin-user.schema";
import { useCreateUser } from "@/services/users/mutations/admin-user.mutation";
import { uploadFilesApi } from "@/services/upload/apis/upload.api";

interface CreateUserPageProps {
  roles: Array<{ id: number; name: string }>;
}

export default function CreateUserPage({ roles }: CreateUserPageProps) {
  const { mutate, isPending } = useCreateUser();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const defaultValues = useMemo<UserFormValues>(
    () => ({
      roleId: roles[0]?.id ?? 1,
      name: "",
      paternalLastName: "",
      maternalLastName: "",
      photoUrl: "",
      line1: "",
      line2: "",
      city: "",
      region: "",
      phone: "",
      email: "",
      password: "",
    }),
    [roles]
  );

  const handleSubmit = async (values: UserFormValues) => {
    setFileError("");
    if (photoFiles.length > 0) {
      setIsUploading(true);
      const uploaded = await uploadFilesApi(photoFiles);
      setIsUploading(false);

      if (uploaded.length === 0) {
        setFileError("Error al subir la foto");
        return;
      }

      values.photoUrl = uploaded[0]?.url;
    }

    mutate(values);
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo usuario</h1>
          <p className="text-muted-foreground">
            Define los datos y rol del colaborador
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del usuario</CardTitle>
          <CardDescription>Los campos con * son obligatorios.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            roles={roles}
            isSubmitting={isPending}
            submitLabel="Crear usuario"
            onPhotoChange={(files) => {
              setPhotoFiles(files);
              setFileError("");
            }}
            photoError={fileError}
            isUploadingPhoto={isUploading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
