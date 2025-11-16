"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";

import { updateUserSchema, type UpdateUserInput } from "@/schemas/user.schema";
import { useUpdateUser } from "@/services/users/mutations/user.mutation";
import { uploadFilesApi } from "@/services/upload/apis/upload.api";
import type { users } from "@/drizzle/schema";

interface AccountEditClientProps {
  user: typeof users.$inferSelect;
}

export default function AccountEditClient({ user }: AccountEditClientProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema) as Resolver<UpdateUserInput>,
    defaultValues: {
      name: user.name,
      paternalLastName: user.paternalLastName || "",
      maternalLastName: user.maternalLastName || "",
      photoUrl: user.photoUrl || "",
      line1: user.line1 || "",
      line2: user.line2 || "",
      city: user.city || "",
      region: user.region || "",
      phone: user.phone || "",
    },
  });

  const { mutate, isPending } = useUpdateUser();

  const onSubmit = async (values: UpdateUserInput) => {
    // Handle image upload if new file is selected
    if (imageFiles.length > 0) {
      setIsUploading(true);
      setFileError("");

      const uploadedImages = await uploadFilesApi(imageFiles);
      setIsUploading(false);

      if (uploadedImages.length === 0) {
        setFileError("Error al subir la imagen");
        return;
      }

      setFileError("");

      // Update with uploaded image URL
      mutate({
        ...values,
        photoUrl: uploadedImages[0].url,
      });
    } else {
      // Update without changing image
      mutate(values);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const isSubmitting = isPending || isUploading;

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/account">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar perfil</h1>
          <p className="text-muted-foreground">
            Actualiza tu información personal y de contacto
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>
            Modifica los datos que desees actualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              {/* Photo Upload */}
              <Field>
                <FieldLabel>Foto de perfil</FieldLabel>
                <FileUpload
                  accept={{
                    "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
                  }}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024}
                  onChange={handleFilesChange}
                  existingFiles={
                    user.photoUrl
                      ? [{ url: user.photoUrl, name: "Foto actual" }]
                      : []
                  }
                />
                {fileError && <FieldError>{fileError}</FieldError>}
              </Field>

              {/* Name */}
              <Field>
                <FieldLabel htmlFor="name">
                  Nombre <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <FieldError>{form.formState.errors.name.message}</FieldError>
                )}
              </Field>

              {/* Paternal Last Name */}
              <Field>
                <FieldLabel htmlFor="paternalLastName">
                  Apellido paterno
                </FieldLabel>
                <Input
                  id="paternalLastName"
                  type="text"
                  placeholder="Pérez"
                  {...form.register("paternalLastName")}
                />
                {form.formState.errors.paternalLastName && (
                  <FieldError>
                    {form.formState.errors.paternalLastName.message}
                  </FieldError>
                )}
              </Field>

              {/* Maternal Last Name */}
              <Field>
                <FieldLabel htmlFor="maternalLastName">
                  Apellido materno
                </FieldLabel>
                <Input
                  id="maternalLastName"
                  type="text"
                  placeholder="García"
                  {...form.register("maternalLastName")}
                />
                {form.formState.errors.maternalLastName && (
                  <FieldError>
                    {form.formState.errors.maternalLastName.message}
                  </FieldError>
                )}
              </Field>

              {/* Phone */}
              <Field>
                <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 123 456 7890"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <FieldError>{form.formState.errors.phone.message}</FieldError>
                )}
              </Field>

              {/* Email (readonly) */}
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El correo electrónico no se puede modificar
                </p>
              </Field>
            </FieldGroup>

            <CardHeader className="px-0">
              <CardTitle className="text-lg">Dirección</CardTitle>
            </CardHeader>

            <FieldGroup>
              {/* Line 1 */}
              <Field>
                <FieldLabel htmlFor="line1">Dirección línea 1</FieldLabel>
                <Input
                  id="line1"
                  type="text"
                  placeholder="Calle Principal 123"
                  {...form.register("line1")}
                />
                {form.formState.errors.line1 && (
                  <FieldError>{form.formState.errors.line1.message}</FieldError>
                )}
              </Field>

              {/* Line 2 */}
              <Field>
                <FieldLabel htmlFor="line2">Dirección línea 2</FieldLabel>
                <Input
                  id="line2"
                  type="text"
                  placeholder="Depto. 4B, Referencias adicionales"
                  {...form.register("line2")}
                />
                {form.formState.errors.line2 && (
                  <FieldError>{form.formState.errors.line2.message}</FieldError>
                )}
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                {/* City */}
                <Field>
                  <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Ciudad de México"
                    {...form.register("city")}
                  />
                  {form.formState.errors.city && (
                    <FieldError>
                      {form.formState.errors.city.message}
                    </FieldError>
                  )}
                </Field>

                {/* Region */}
                <Field>
                  <FieldLabel htmlFor="region">Estado/Región</FieldLabel>
                  <Input
                    id="region"
                    type="text"
                    placeholder="CDMX"
                    {...form.register("region")}
                  />
                  {form.formState.errors.region && (
                    <FieldError>
                      {form.formState.errors.region.message}
                    </FieldError>
                  )}
                </Field>
              </div>
            </FieldGroup>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/account">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
