import { storeSettings } from "@/drizzle/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const optionalString = () =>
  z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed || undefined;
    });

const colorString = z
  .string()
  .min(1, "Debes definir un color")
  .regex(/^#?[0-9a-fA-F]{3,8}$/, "Color inválido")
  .transform((val) => (val.startsWith("#") ? val : `#${val}`));

const optionalColorString = z
  .string()
  .regex(/^#?[0-9a-fA-F]{3,8}$/, "Color inválido")
  .optional()
  .or(z.literal(""))
  .transform((val) => {
    if (!val) return undefined;
    return val.startsWith("#") ? val : `#${val}`;
  });

const upperString = (length: number) =>
  z
    .string()
    .length(length)
    .transform((value) => value.toUpperCase());

export const storeSettingsInsertSchema = createInsertSchema(storeSettings, {
  companyName: z
    .string()
    .min(1, "El nombre de la empresa es obligatorio")
    .max(180),
  legalName: optionalString(),
  taxId: optionalString(),
  ruc: optionalString(),
  email: optionalString(),
  phone: optionalString(),
  companyLine1: optionalString(),
  companyLine2: optionalString(),
  companyCity: optionalString(),
  companyRegion: optionalString(),
  companyPostalCode: optionalString(),
  companyCountryCode: optionalString()
    .transform((val) => val?.toUpperCase())
    .refine((val) => !val || val.length === 2, {
      message: "Usa el código ISO de 2 letras",
    }),
  primaryColor: colorString,
  secondaryColor: optionalColorString,
  accentColor: optionalColorString,
  fontFamily: optionalString(),
  currency: upperString(3),
  timezone: z.string().min(1, "Debes definir una zona horaria"),
  logoUrl: optionalString(),
  privacyPolicyHtml: optionalString(),
  termsHtml: optionalString(),
  shippingPolicyHtml: optionalString(),
  refundPolicyHtml: optionalString(),
});

export const storeSettingsFormSchema = storeSettingsInsertSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.number().int().optional(),
    secondaryColor: optionalString(),
    accentColor: optionalString(),
  });

export type StoreSettingsFormValues = z.infer<typeof storeSettingsFormSchema>;

export const defaultStoreSettings: StoreSettingsFormValues = {
  id: undefined,
  companyName: "",
  legalName: "",
  taxId: "",
  ruc: "",
  email: "",
  phone: "",
  companyLine1: "",
  companyLine2: "",
  companyCity: "",
  companyRegion: "",
  companyPostalCode: "",
  companyCountryCode: "PE",
  primaryColor: "#111827",
  secondaryColor: "#0ea5e9",
  accentColor: "#f97316",
  fontFamily: "Inter",
  currency: "USD",
  timezone: "America/Lima",
  logoUrl: "",
  privacyPolicyHtml: "",
  termsHtml: "",
  shippingPolicyHtml: "",
  refundPolicyHtml: "",
};
