"use client";

import { useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  storeSettingsFormSchema,
  type StoreSettingsFormValues,
} from "@/schemas/store-settings.schema";
import { uploadFilesApi } from "@/services/upload/apis/upload.api";

interface StoreSettingsFormProps {
  defaultValues: StoreSettingsFormValues;
  onSubmit: (values: StoreSettingsFormValues) => void;
  isSubmitting?: boolean;
}

export function StoreSettingsForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: StoreSettingsFormProps) {
  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(
      storeSettingsFormSchema
    ) as unknown as Resolver<StoreSettingsFormValues>,
    defaultValues,
  });

  const [tab, setTab] = useState("company");
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [logoError, setLogoError] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleSubmit = async (values: StoreSettingsFormValues) => {
    setLogoError("");

    if (logoFiles.length > 0) {
      setIsUploadingLogo(true);
      const uploaded = await uploadFilesApi(logoFiles);
      setIsUploadingLogo(false);

      if (uploaded.length === 0) {
        setLogoError("Error al subir el logo");
        return;
      }

      values.logoUrl = uploaded[0]?.url;
    }

    onSubmit(values);
  };

  const handleLogoChange = (files: File[]) => {
    setLogoFiles(files);
    setLogoError("");
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
      data-testid="store-settings-form"
    >
      <input type="hidden" value={form.watch("id") ?? ""} readOnly hidden />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
        </TabsList>
        <TabsContent value="company">
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="companyName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-name">
                      Nombre comercial
                    </FieldLabel>
                  <Input
                    {...field}
                    id="company-name"
                    value={field.value ?? ""}
                    placeholder="Mi tienda"
                    aria-invalid={fieldState.invalid}
                  />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="legalName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="legal-name">
                      Razón social (opcional)
                    </FieldLabel>
                  <Input
                    {...field}
                    id="legal-name"
                    value={field.value ?? ""}
                    placeholder="Mi empresa S.A."
                    aria-invalid={fieldState.invalid}
                  />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="taxId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="tax-id">RFC / Tax ID</FieldLabel>
                  <Input
                    {...field}
                    id="tax-id"
                    value={field.value ?? ""}
                    placeholder="123456789"
                    aria-invalid={fieldState.invalid}
                  />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="ruc"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="ruc">RUC</FieldLabel>
                  <Input
                    {...field}
                    id="ruc"
                    value={field.value ?? ""}
                    placeholder="12345678901"
                    aria-invalid={fieldState.invalid}
                  />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-email">Correo</FieldLabel>
                  <Input
                    {...field}
                    id="company-email"
                    type="email"
                    value={field.value ?? ""}
                    placeholder="contacto@tienda.com"
                    aria-invalid={fieldState.invalid}
                  />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-phone">Teléfono</FieldLabel>
                  <Input
                    {...field}
                    id="company-phone"
                    value={field.value ?? ""}
                    placeholder="+51 999 999 999"
                    aria-invalid={fieldState.invalid}
                  />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4">
              <Controller
                name="companyLine1"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-line1">Dirección</FieldLabel>
                <Input
                  {...field}
                  id="company-line1"
                  value={field.value ?? ""}
                  placeholder="Av. Siempre Viva 742"
                  aria-invalid={fieldState.invalid}
                />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="companyLine2"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-line2">Complemento</FieldLabel>
                <Input
                  {...field}
                  id="company-line2"
                  value={field.value ?? ""}
                  placeholder="Oficina 301"
                  aria-invalid={fieldState.invalid}
                />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Controller
                name="companyCity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-city">Ciudad</FieldLabel>
                    <Input
                      {...field}
                      id="company-city"
                      value={field.value ?? ""}
                      placeholder="Lima"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="companyRegion"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-region">Región</FieldLabel>
                    <Input
                      {...field}
                      id="company-region"
                      value={field.value ?? ""}
                      placeholder="Lima"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="companyPostalCode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-zip">Código postal</FieldLabel>
                    <Input
                      {...field}
                      id="company-zip"
                      value={field.value ?? ""}
                      placeholder="15000"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="companyCountryCode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="company-country">País (ISO)</FieldLabel>
                    <Input
                      {...field}
                      id="company-country"
                      maxLength={2}
                      value={field.value ?? ""}
                      placeholder="PE"
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
        </TabsContent>
        <TabsContent value="branding">
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="primaryColor"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Color primario</FieldLabel>
                    <Input
                      type="color"
                      value={field.value ?? "#000000"}
                      onChange={(event) => field.onChange(event.target.value)}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="secondaryColor"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Color secundario</FieldLabel>
                    <Input
                      type="color"
                      value={field.value ?? "#ffffff"}
                      onChange={(event) => field.onChange(event.target.value)}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="accentColor"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Color de acento</FieldLabel>
                    <Input
                      type="color"
                      value={field.value ?? "#ffffff"}
                      onChange={(event) => field.onChange(event.target.value)}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="fontFamily"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="font-family">Tipografía</FieldLabel>
                    <Input
                      {...field}
                      id="font-family"
                      value={field.value ?? ""}
                      placeholder="Inter"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                name="currency"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="currency">Moneda (ISO)</FieldLabel>
                    <Input
                      {...field}
                      id="currency"
                      maxLength={3}
                      value={field.value ?? ""}
                      placeholder="USD"
                      aria-invalid={fieldState.invalid}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="timezone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="timezone">Zona horaria</FieldLabel>
                    <Input
                      {...field}
                      id="timezone"
                      value={field.value ?? ""}
                      placeholder="America/Lima"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="logoUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <div>
                    <FileUpload
                      label="Logo"
                      description="Sube el logotipo en formato PNG o JPG (máx. 1MB)"
                      existingFiles={
                        field.value ? [{ url: field.value, name: "Logo actual" }] : []
                      }
                      onChange={(files) => {
                        handleLogoChange(files);
                        field.onChange(field.value);
                      }}
                      onDeleteExisting={() => {
                        field.onChange("");
                        setLogoFiles([]);
                        setLogoError("");
                      }}
                      maxFiles={1}
                      maxSize={1 * 1024 * 1024}
                      disabled={isSubmitting || isUploadingLogo}
                      error={logoError || fieldState.error?.message}
                    />
                  </div>
                )}
              />
           </div>
          </FieldGroup>
        </TabsContent>
        <TabsContent value="policies">
          <FieldGroup>
            <Controller
              name="privacyPolicyHtml"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="privacy-policy">
                    Política de privacidad
                  </FieldLabel>
              <Textarea
                {...field}
                id="privacy-policy"
                rows={6}
                value={field.value ?? ""}
                placeholder="Contenido HTML o texto de la política"
                aria-invalid={fieldState.invalid}
              />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="termsHtml"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="terms">
                    Términos y condiciones
                  </FieldLabel>
              <Textarea
                {...field}
                id="terms"
                rows={6}
                value={field.value ?? ""}
                placeholder="Contenido HTML o texto"
                aria-invalid={fieldState.invalid}
              />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="shippingPolicyHtml"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="shipping-policy">
                    Política de envíos
                  </FieldLabel>
              <Textarea
                {...field}
                id="shipping-policy"
                rows={6}
                value={field.value ?? ""}
                placeholder="Contenido de envíos"
                aria-invalid={fieldState.invalid}
              />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="refundPolicyHtml"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="refund-policy">
                    Política de devoluciones
                  </FieldLabel>
              <Textarea
                {...field}
                id="refund-policy"
                rows={6}
                value={field.value ?? ""}
                placeholder="Proceso y tiempos de devolución"
                aria-invalid={fieldState.invalid}
              />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar configuración"}
        </Button>
      </div>
    </form>
  );
}
