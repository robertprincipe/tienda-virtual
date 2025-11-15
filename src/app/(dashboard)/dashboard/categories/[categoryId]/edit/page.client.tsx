"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload, type ExistingFile } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriesSchema, SelectCategory } from "@/schemas/category.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateCategory } from "@/services/categories/mutations/category.mutation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { z } from "zod/v4";
import { uploadFilesApi } from "@/services/upload/apis/upload.api";
import { parseIntSafety } from "@/lib/utils";
import { useCategories } from "@/services/categories/queries/category.query";

interface EditCategoryProps {
  category: SelectCategory;
}

export default function EditCategory({ category }: EditCategoryProps) {
  const [fileError, setFileError] = useState<string>("");
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>(
    category.imageUrl
      ? [
          {
            url: category.imageUrl,
            name: category.name,
            type: "image/*",
          },
        ]
      : []
  );

  const { data: categories } = useCategories({
    notInIds: [category.id],
  });

  const [imageFiles, setImageFiles] = useState<File[]>();

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { mutate, isPending } = useUpdateCategory();

  const form = useForm({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      name: category.name || "",
      slug: category.slug || "",
      imageUrl: category.imageUrl || "",
      parentId: category.parentId,
      description: category.description || "",
      isActive: category.isActive ?? true,
    },
  });

  const submit = async (values: z.infer<typeof categoriesSchema>) => {
    if (existingFiles.length === 0 && !imageFiles) {
      setFileError("La imagen es obligatoria");
      return;
    }

    if (imageFiles && imageFiles.length > 0) {
      setIsUploading(true);
      const images = await uploadFilesApi(imageFiles);
      setIsUploading(false);

      if (images.length === 0) {
        setFileError("Error al subir la imagen");
        return;
      }
      values.imageUrl = images[0]?.url || "";
    }

    // Validar que se haya seleccionado una imagen
    if (!values.imageUrl) {
      setFileError("La imagen es obligatoria");
      return;
    }

    setFileError("");

    mutate({
      ...values,
      id: category.id,
    });
  };

  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const handleDeleteExisting = () => {
    setExistingFiles([]);
    // setData("delete_image", true);
    // setData("image", null);
    // No validamos aquí, se valida en el submit
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Editar Categoría
          </h1>
          <p className="text-muted-foreground">
            Actualiza la información de &quot;{category.name}&quot;
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
          <CardDescription>
            Actualiza los campos que desees modificar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input id="name" placeholder="Electrónica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input id="name" placeholder="Electrónica" {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Deja vacío para generar automáticamente desde el nombre
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Imagen */}
              <FileUpload
                label="Imagen"
                description="Sube una imagen para la categoría (máx. 2MB)"
                required
                existingFiles={existingFiles}
                maxFiles={1}
                maxSize={2 * 1024 * 1024}
                accept={{
                  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                }}
                onDeleteExisting={handleDeleteExisting}
                onChange={handleFilesChange}
                onError={setFileError}
                error={form.formState.errors.imageUrl?.message || fileError}
                disabled={isPending || isUploading}
              />

              {categories && categories.length > 0 ? (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría Padre</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseIntSafety(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ninguna (categoría raíz)" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id?.toString() || ""}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <p className="text-sm text-muted-foreground">
                        Selecciona una categoría padre para crear una
                        subcategoría
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción de la categoría..."
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Deja vacío para generar automáticamente desde el nombre
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Estado Activo */}
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Checkbox
                          id="is_active"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Label htmlFor="is_active" className="cursor-pointer">
                  Categoría activa
                </Label>
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isPending || isUploading}>
                  {isPending || isUploading
                    ? "Guardando..."
                    : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/categories">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
