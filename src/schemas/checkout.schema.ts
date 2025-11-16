/**
 * Schemas Zod para checkout
 */

import { z } from "zod";

// Schema para dirección de envío
export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nombre completo es requerido")
    .max(150, "Nombre muy largo"),
  line1: z
    .string()
    .min(1, "Dirección es requerida")
    .max(200, "Dirección muy larga"),
  line2: z.string().max(200, "Dirección muy larga").optional(),
  city: z.string().min(1, "Ciudad es requerida").max(100, "Ciudad muy larga"),
  region: z.string().max(100, "Región muy larga").optional(),
  postalCode: z.string().max(20, "Código postal muy largo").optional(),
  countryCode: z
    .string()
    .length(2, "Código de país debe tener 2 caracteres")
    .toUpperCase(),
  phone: z.string().max(32, "Teléfono muy largo").optional(),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// Schema para aplicar cupón
export const applyCouponSchema = z.object({
  cartId: z.number().int().positive(),
  couponCode: z
    .string()
    .min(1, "Código de cupón es requerido")
    .max(100)
    .toUpperCase()
    .trim(),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;

// Schema para checkout completo
export const checkoutSchema = z.object({
  email: z.string().email("Email inválido").max(180),
  useStoredAddress: z.boolean().default(false),
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// Schema para datos del formulario de checkout
export const checkoutFormSchema = z
  .object({
    email: z.string().email("Email inválido").max(180),
    useStoredAddress: z.boolean().default(false),
    fullName: z
      .string()
      .min(1, "Nombre completo es requerido")
      .max(150, "Nombre muy largo"),
    line1: z
      .string()
      .min(1, "Dirección es requerida")
      .max(200, "Dirección muy larga"),
    line2: z.string().max(200, "Dirección muy larga").optional(),
    city: z.string().min(1, "Ciudad es requerida").max(100, "Ciudad muy larga"),
    region: z.string().max(100, "Región muy larga").optional(),
    postalCode: z.string().max(20, "Código postal muy largo").optional(),
    countryCode: z
      .string()
      .length(2, "Código de país debe tener 2 caracteres")
      .toUpperCase(),
    phone: z.string().max(32, "Teléfono muy largo").optional(),
    couponCode: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      // Si useStoredAddress es false, todos los campos de dirección son requeridos
      if (!data.useStoredAddress) {
        return data.fullName && data.line1 && data.city && data.countryCode;
      }
      return true;
    },
    {
      message: "Todos los campos de dirección son requeridos",
    }
  );

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
