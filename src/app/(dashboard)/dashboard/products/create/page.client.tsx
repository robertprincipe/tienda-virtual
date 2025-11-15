"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { productStatuses } from "@/drizzle/schema";
import { parseIntSafety } from "@/lib/utils";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/schemas/product.schema";
import { type Category } from "@/schemas/category.schema";
import { useCreateProduct } from "@/services/products/mutations/product.mutation";
import { uploadFilesApi } from "@/services/upload/apis/upload.api";

interface CreateProductPageProps {
  categories: Category[];
}

export default function CreateProductPage({ categories }: CreateProductPageProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      categoryId: undefined,
      shortDesc: "",
      description: "",
      stock: 0,
      price: 0,
      compareAtPrice: undefined,
      purchasePrice: undefined,
      weightGrams: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      status: "draft",
    },
  });

  const { mutate, isPending } = useCreateProduct();

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!imageFiles || imageFiles.length === 0) {
      setFileError("Debes subir al menos una imagen");
      return;
    }

    setIsUploading(true);
    const uploadedImages = await uploadFilesApi(imageFiles);
    setIsUploading(false);

    if (uploadedImages.length === 0) {
      setFileError("Error al subir las imágenes");
      return;
    }

    setFileError("");

    mutate({
      ...values,
      images: uploadedImages.map((image) => ({
        url: image.url,
        altText: image.name,
      })),
    });
  };

  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const isSubmitting = isPending || isUploading;

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo producto</h1>
          <p className="text-muted-foreground">
            Completa la información para agregar un nuevo producto al catálogo
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del producto</CardTitle>
          <CardDescription>
            Define la información principal que se mostrará al publicar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Cámara profesional" {...field} />
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
                      <FormLabel>Slug (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="camara-profesional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(parseIntSafety(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id?.toString() ?? ""}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productStatuses.enumValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status === "active"
                                ? "Activo"
                                : status === "draft"
                                  ? "Borrador"
                                  : "Archivado"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDesc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción corta</FormLabel>
                      <FormControl>
                        <Input placeholder="Texto breve para listados" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción detallada</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Describe las características principales"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio antes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inventario</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Largo (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ancho (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alto (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value === ""
                                ? undefined
                                : Number(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label>Galería</Label>
                <FileUpload
                  label="Imágenes"
                  description="Agrega al menos una imagen (máx. 5)"
                  maxFiles={5}
                  required
                  accept={{
                    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                  }}
                  onChange={handleFilesChange}
                  onError={setFileError}
                  error={fileError}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href="/dashboard/products">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar producto"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
