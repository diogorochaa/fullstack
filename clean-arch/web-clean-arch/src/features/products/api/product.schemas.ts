import { z } from "zod";

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const productResponseSchema = z.object({
  product: productSchema,
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto."),
  price: z.coerce.number().positive("Informe um preço maior que zero."),
});

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
