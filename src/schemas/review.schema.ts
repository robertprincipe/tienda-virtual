import { z } from "zod";

// Create review schema
export const createReviewSchema = z.object({
  productId: z.number().int().positive({ message: "ID de producto inválido" }),
  rating: z
    .number()
    .min(1, { message: "La calificación mínima es 1 estrella" })
    .max(5, { message: "La calificación máxima es 5 estrellas" }),
  title: z
    .string()
    .max(150, { message: "El título debe tener menos de 150 caracteres" })
    .trim()
    .optional()
    .or(z.literal("")),
  body: z
    .string()
    .max(1000, { message: "La reseña debe tener menos de 1000 caracteres" })
    .trim()
    .optional()
    .or(z.literal("")),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
