import { roles, users } from "@/drizzle/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const optionalString = (max: number, message?: string) =>
  z
    .string()
    .max(max, message ?? `Debe tener máximo ${max} caracteres`)
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value?.trim() || undefined);

const phoneSchema = z
  .string()
  .max(32, "Debe tener máximo 32 caracteres")
  .regex(/^[0-9+\-()\s]*$/, {
    message: "Formato de teléfono inválido",
  })
  .optional()
  .or(z.literal(""))
  .transform((value) => value?.trim() || undefined);

export const userInsertSchema = createInsertSchema(users, {
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(255, "Debe tener máximo 255 caracteres")
    .trim(),
  paternalLastName: optionalString(255),
  maternalLastName: optionalString(255),
  photoUrl: optionalString(500),
  line1: optionalString(200),
  line2: optionalString(200),
  city: optionalString(100),
  region: optionalString(100),
  phone: phoneSchema,
  email: z
    .string()
    .email("Correo inválido")
    .max(255, "Debe tener máximo 255 caracteres")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const userFormSchema = userInsertSchema
  .omit({
    rememberToken: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.number().int().optional(),
    roleId: z
      .number({ error: "Selecciona un rol" })
      .int("Selecciona un rol válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .optional()
      .or(z.literal(""))
      .transform((value) => value?.trim() || undefined),
  });

export type UserFormValues = z.infer<typeof userFormSchema>;

export type UserListItem = typeof users.$inferSelect & {
  role?: typeof roles.$inferSelect | null;
};

export const paginatedUsersSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
  roleId: z.coerce.number().optional(),
});

export type GetPaginatedUsersInput = z.infer<typeof paginatedUsersSchema>;
