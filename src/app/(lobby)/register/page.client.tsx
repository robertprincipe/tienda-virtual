"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";

import AuthCardLayout from "@/layouts/auth/auth-card-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerUserSchema } from "@/schemas/auth.schema";
import { useRegisterMutation } from "@/services/auth/mutations/auth.mutation";

const RegisterPage = () => {
  const form = useForm({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: "",
      paternalLastName: "",
      maternalLastName: "",
      email: "",
      password: "",
    },
  });

  const { mutate, isPending } = useRegisterMutation();

  const onSubmit = (values: z.infer<typeof registerUserSchema>) => {
    mutate(values);
  };

  return (
    <AuthCardLayout
      title="Crear cuenta"
      description="Regístrate para administrar tus categorías y productos."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre"
                      autoComplete="given-name"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paternalLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido paterno</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apellido paterno"
                      autoComplete="family-name"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="maternalLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido materno (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Apellido materno"
                    autoComplete="additional-name"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tu-correo@empresa.com"
                    autoComplete="email"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    autoComplete="new-password"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="font-medium text-primary">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthCardLayout>
  );
};

export default RegisterPage;
