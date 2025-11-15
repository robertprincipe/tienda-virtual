"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, SubmitHandler, useForm, Resolver } from "react-hook-form";
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
import { ExistingFile, FileUpload } from "@/components/ui/file-upload";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
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

export default function EditProductPage({
  product,
  categories,
}: EditProductPageProps) {
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
    resolver: zodResolver(
      productFormSchema
    ) as unknown as Resolver<ProductFormValues>,
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

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
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

  const numberChangeHandler =
    (field: { onChange: (value: number | undefined) => void }) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
            Actualiza la información de &quot;{product.name}&quot;
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del producto</CardTitle>
          <CardDescription>Modifica los campos necesarios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
                      <Input
                        {...field}
                        id="product-name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-slug">Slug</FieldLabel>
                      <Input
                        {...field}
                        id="product-slug"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="sku"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
                      <Input
                        {...field}
                        id="product-sku"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-category">
                        Categoría
                      </FieldLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseIntSafety(value))
                        }
                      >
                        <SelectTrigger
                          id="product-category"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-status">Estado</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="product-status"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="shortDesc"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-short-desc">
                        Descripción corta
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-short-desc"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-description">
                      Descripción
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="product-description"
                      rows={5}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <Controller
                  name="price"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-price">Precio</FieldLabel>
                      <Input
                        {...field}
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="compareAtPrice"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-compare-price">
                        Precio antes
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-compare-price"
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="purchasePrice"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-purchase-price">
                        Costo
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-purchase-price"
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="stock"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-stock">
                        Inventario
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-stock"
                        type="number"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="weightGrams"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-weight">Peso (g)</FieldLabel>
                      <Input
                        {...field}
                        id="product-weight"
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Controller
                  name="length"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-length">
                        Largo (cm)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-length"
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="width"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-width">
                        Ancho (cm)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-width"
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="height"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-height">
                        Alto (cm)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-height"
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={numberChangeHandler(field)}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
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
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/products">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Actualizando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
