"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { categoriesSchema, Category } from "@/schemas/category.schema";
import { z } from "zod/v4";
import { useCreateCategory } from "@/services/categories/mutations/category.mutation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { uploadFilesApi } from "@/services/upload/apis/upload.api";
import { parseIntSafety } from "@/lib/utils";

interface CreateCategoryProps {
  categories: Category[];
}

export default function CreateCategory({ categories }: CreateCategoryProps) {
  const [fileError, setFileError] = useState<string>("");

  const [imageFiles, setImageFiles] = useState<File[]>();

  const [isUploading, setIsUploading] = useState<boolean>(false);

  const form = useForm({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: undefined,
      description: "",
      isActive: true,
      imageUrl: "",
    },
  });

  const { mutate, isPending } = useCreateCategory();

  const submit = async (values: z.infer<typeof categoriesSchema>) => {
    setIsUploading(true);
    if (!imageFiles || imageFiles.length === 0) {
      setFileError("La imagen es obligatoria");
      return;
    }

    const images = await uploadFilesApi(imageFiles);

    setIsUploading(false);

    if (images.length === 0) {
      setFileError("Error al subir la imagen");
      return;
    }

    values.imageUrl = images[0]?.url || "";

    // Validar que se haya seleccionado una imagen
    if (!values.imageUrl) {
      setFileError("La imagen es obligatoria");
      return;
    }

    mutate(values);
  };

  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
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
          <h1 className="text-3xl font-bold tracking-tight">Nueva Categoría</h1>
          <p className="text-muted-foreground">
            Crea una nueva categoría para organizar tus productos
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
          <CardDescription>
            Complete los siguientes campos para crear una nueva categoría
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
                maxFiles={1}
                maxSize={2 * 1024 * 1024}
                accept={{
                  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                }}
                onChange={handleFilesChange}
                onError={setFileError}
                error={form.formState.errors.imageUrl?.message || fileError}
                disabled={isPending || isUploading}
              />

              {/* Categoría Padre */}
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
                          {categories.map((category) => (
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
                      Selecciona una categoría padre para crear una subcategoría
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción */}

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
                  {isPending || isUploading ? "Creando..." : "Crear Categoría"}
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
