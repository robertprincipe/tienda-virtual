"use client";

import { StoreSettingsForm } from "@/components/settings/store-settings-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StoreSettingsFormValues } from "@/schemas/store-settings.schema";
import { useUpdateStoreSettings } from "@/services/store-settings/mutations/store-setting.mutation";

interface SettingsPageProps {
  settings: StoreSettingsFormValues;
}

export default function SettingsPage({ settings }: SettingsPageProps) {
  const { mutate, isPending } = useUpdateStoreSettings();

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración de la tienda</h1>
        <p className="text-muted-foreground">
          Actualiza la información corporativa, branding y políticas públicas de tu tienda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Organiza los datos de tu empresa y las políticas disponibles para los clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StoreSettingsForm
            defaultValues={settings}
            onSubmit={(values) => mutate(values)}
            isSubmitting={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
