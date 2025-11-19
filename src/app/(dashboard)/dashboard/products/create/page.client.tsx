"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, Resolver, SubmitHandler, useForm } from "react-hook-form";
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

export default function CreateProductPage({
  categories,
}: CreateProductPageProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(
      productFormSchema
    ) as unknown as Resolver<ProductFormValues>,
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      categoryId: undefined,
      shortDesc: "",
      description: "",
      stock: undefined,
      price: undefined,
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

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
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

  const numberChangeHandler =
    (field: { onChange: (value: number | undefined) => void }) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      field.onChange(value === "" ? undefined : Number(value));
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
                        placeholder="Cámara profesional"
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
                      <FieldLabel htmlFor="product-slug">
                        Slug (opcional)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="product-slug"
                        placeholder="camara-profesional"
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
                        placeholder="SKU-001"
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
                        placeholder="Texto breve para listados"
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
                      Descripción detallada
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="product-description"
                      rows={5}
                      placeholder="Describe las características principales"
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
                        step="0.1"
                        placeholder="0.00"
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
                        step="0.1"
                        placeholder="0.00"
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
                        step="0.1"
                        placeholder="0.00"
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
                        placeholder="0"
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
                        step="0.1"
                        placeholder="0"
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
                        step="0.1"
                        placeholder="0"
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
                        step="0.1"
                        placeholder="0"
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
                        step="0.1"
                        placeholder="0"
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
            </FieldGroup>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/products">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
