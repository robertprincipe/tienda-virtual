"use server";

import { db } from "@/drizzle/db";
import { storeSettings } from "@/drizzle/schema";
import {
  defaultStoreSettings,
  storeSettingsFormSchema,
  type StoreSettingsFormValues,
} from "@/schemas/store-settings.schema";
import { eq } from "drizzle-orm";

export const getStoreSettings = async (): Promise<StoreSettingsFormValues> => {
  const record = await db.query.storeSettings.findFirst();

  if (!record) {
    return { ...defaultStoreSettings };
  }

  const { ...rest } = record;

  const sanitized = Object.entries(defaultStoreSettings).reduce(
    (acc, [key, defaultValue]) => {
      const value = (rest as Record<string, unknown>)[key];
      (acc as Record<string, unknown>)[key] =
        value === null || value === undefined ? defaultValue : value;
      return acc;
    },
    {} as StoreSettingsFormValues
  );

  return {
    ...sanitized,
    id: record.id,
  };
};

export const updateStoreSettings = async (input: StoreSettingsFormValues) => {
  const data = storeSettingsFormSchema.parse(input);
  const { id, ...values } = data;

  const existing = id
    ? await db.query.storeSettings.findFirst({
        where: eq(storeSettings.id, id),
        columns: { id: true },
      })
    : await db.query.storeSettings.findFirst({
        columns: { id: true },
      });

  if (existing?.id) {
    const [updated] = await db
      .update(storeSettings)
      .set({
        ...values,
        updatedAt: new Date(),
      })
      .where(eq(storeSettings.id, existing.id))
      .returning({ id: storeSettings.id });

    return {
      message: "Configuración actualizada correctamente",
      result: {
        id: updated.id,
      },
    };
  }

  const [created] = await db
    .insert(storeSettings)
    .values(values)
    .returning({ id: storeSettings.id });

  return {
    message: "Configuración creada correctamente",
    result: {
      id: created.id,
    },
  };
};
