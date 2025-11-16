"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  userFormSchema,
  type UserFormValues,
} from "@/schemas/admin-user.schema";

interface UserFormProps {
  defaultValues: UserFormValues;
  onSubmit: (values: UserFormValues) => void;
  roles: Array<{ id: number; name: string }>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function UserForm({
  defaultValues,
  onSubmit,
  roles,
  isSubmitting,
  submitLabel = "Guardar usuario",
}: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema) as unknown as Resolver<UserFormValues>,
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-name">Nombre</FieldLabel>
                <Input
                  {...field}
                  id="user-name"
                  value={field.value ?? ""}
                  placeholder="Nombre"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="roleId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Rol</FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="paternalLastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-lastname">Apellido paterno</FieldLabel>
                <Input
                  {...field}
                  id="user-lastname"
                  value={field.value ?? ""}
                  placeholder="Apellido paterno"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="maternalLastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-mother-lastname">Apellido materno</FieldLabel>
                <Input
                  {...field}
                  id="user-mother-lastname"
                  value={field.value ?? ""}
                  placeholder="Apellido materno"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-email">Correo</FieldLabel>
                <Input
                  {...field}
                  id="user-email"
                  value={field.value ?? ""}
                  type="email"
                  placeholder="usuario@correo.com"
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
                <FieldLabel htmlFor="user-phone">Teléfono</FieldLabel>
                <Input
                  {...field}
                  id="user-phone"
                  value={field.value ?? ""}
                  placeholder="+51 999 999 999"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="user-password">
                Contraseña {defaultValues.id ? "(opcional)" : ""}
              </FieldLabel>
              <Input
                {...field}
                id="user-password"
                type="password"
                value={field.value ?? ""}
                placeholder={defaultValues.id ? "Dejar vacío para mantener" : "********"}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="line1"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-address">Dirección</FieldLabel>
                <Input
                  {...field}
                  id="user-address"
                  value={field.value ?? ""}
                  placeholder="Av. Siempre Viva 742"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="line2"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-address2">Complemento</FieldLabel>
                <Input
                  {...field}
                  id="user-address2"
                  value={field.value ?? ""}
                  placeholder="Departamento 101"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-city">Ciudad</FieldLabel>
                <Input
                  {...field}
                  id="user-city"
                  value={field.value ?? ""}
                  placeholder="Lima"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="region"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-region">Región</FieldLabel>
                <Input
                  {...field}
                  id="user-region"
                  value={field.value ?? ""}
                  placeholder="Lima"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="photoUrl"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="user-photo">Foto (URL)</FieldLabel>
                <Input
                  {...field}
                  id="user-photo"
                  value={field.value ?? ""}
                  placeholder="https://"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
