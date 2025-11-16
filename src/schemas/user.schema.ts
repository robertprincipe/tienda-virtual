import { z } from "zod";

// Helper functions for preprocessing
const optionalString = (maxLength: number) =>
  z
    .string()
    .max(maxLength, { message: `Debe tener menos de ${maxLength} caracteres` })
    .trim()
    .optional()
    .or(z.literal(""));

// Update user schema
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, { message: "Debe tener menos de 255 caracteres" })
    .trim(),
  paternalLastName: optionalString(255),
  maternalLastName: optionalString(255),
  photoUrl: optionalString(500),
  line1: optionalString(200),
  line2: optionalString(200),
  city: optionalString(100),
  region: optionalString(100),
  phone: z
    .string()
    .max(32, { message: "Debe tener menos de 32 caracteres" })
    .trim()
    .regex(/^[0-9+\-\s()]*$/, {
      message: "Formato de teléfono inválido",
    })
    .optional()
    .or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
