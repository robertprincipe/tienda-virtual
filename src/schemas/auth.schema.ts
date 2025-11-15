import { z } from "zod/v4";

export const registerUserSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(255),
  paternalLastName: z
    .string()
    .min(1, "El apellido paterno es obligatorio")
    .max(255),
  maternalLastName: z
    .string()
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() ?? ""),
  email: z.string().email("Ingresa un correo válido").max(255),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(255),
});

export const loginUserSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
