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
import {
  ExistingFile,
  FileUpload,
} from "@/components/ui/file-upload";
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
import type { Category } from "@/schemas/category.schema";
import {
  productFormSchema,
  type ProductFormValues,
  type ProductWithRelations,
} from "@/schemas/product.schema";
import { useUpdateProduct } from "@/services/products/mutations/product.mutation";
import { uploadFilesApi } from "@/services/upload/apis/upload.api";

interface EditProductPageProps {
  product: ProductWithRelations;
  categories: Category[];
}

export default function EditProductPage({ product, categories }: EditProductPageProps) {
  const initialImages = product.images ?? [];
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>(
    initialImages.map((image) => ({
      url: image.imageUrl,
      name: image.altText || product.name,
      type: "image/*",
    }))
  );
  const [persistedImages, setPersistedImages] = useState<string[]>(
    initialImages.map((image) => image.imageUrl)
  );
  const [fileError, setFileError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product.name,
      slug: product.slug ?? "",
      sku: product.sku,
      categoryId: product.categoryId,
      shortDesc: product.shortDesc ?? "",
      description: product.description ?? "",
      stock: product.stock ?? 0,
      price: Number(product.price ?? 0),
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : undefined,
      purchasePrice: product.purchasePrice
        ? Number(product.purchasePrice)
        : undefined,
      weightGrams: product.weightGrams
        ? Number(product.weightGrams)
        : undefined,
      length: product.length ? Number(product.length) : undefined,
      width: product.width ? Number(product.width) : undefined,
      height: product.height ? Number(product.height) : undefined,
      status: product.status,
    },
  });

  const { mutate, isPending } = useUpdateProduct();

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    let finalImages = [...persistedImages];

    if (imageFiles.length > 0) {
      setIsUploading(true);
      const uploadedImages = await uploadFilesApi(imageFiles);
      setIsUploading(false);

      if (uploadedImages.length === 0) {
        setFileError("Error al subir las nuevas imágenes");
        return;
      }

      finalImages = [
        ...finalImages,
        ...uploadedImages.map((image) => image.url),
      ];
    }

    if (finalImages.length === 0) {
      setFileError("Debes mantener al menos una imagen");
      return;
    }

    setFileError("");

    mutate({
      ...values,
      id: product.id,
      images: finalImages.map((url) => ({
        url,
        altText: product.name,
      })),
    });
  };

  const handleFilesChange = (files: File[]) => {
    setImageFiles(files);
  };

  const handleDeleteExisting = (file: ExistingFile) => {
    setExistingFiles((prev) => prev.filter((item) => item.url !== file.url));
    setPersistedImages((prev) => prev.filter((url) => url !== file.url));
  };

  const isSubmitting = isPending || isUploading;

  const numberChangeHandler = (field: {
    onChange: (value: number | undefined) => void;
  }) => (event: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(
      event.target.value === "" ? undefined : Number(event.target.value)
    );
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar producto</h1>
          <p className="text-muted-foreground">
            Actualiza la información de "{product.name}"
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del producto</CardTitle>
          <CardDescription>Modifica los campos necesarios</CardDescription>
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                        <Input {...field} />
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
                            <SelectItem key={category.id} value={category.id?.toString() ?? ""}>
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
                        <Input {...field} />
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
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea rows={5} {...field} />
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                          value={field.value ?? ""}
                          onChange={numberChangeHandler(field)}
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
                  description="Puedes reemplazar o agregar imágenes"
                  maxFiles={5}
                  existingFiles={existingFiles}
                  onDeleteExisting={handleDeleteExisting}
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
                  {isSubmitting ? "Actualizando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
