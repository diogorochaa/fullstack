import { z } from "zod";

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const orderResponseSchema = z.object({
  order: orderSchema,
});

export const createOrderSchema = z.object({
  userId: z.uuid("Selecione um usuário válido."),
  productId: z.uuid("Informe um produto válido."),
  quantity: z.coerce.number().int().positive("Informe uma quantidade maior que zero."),
});

export type Order = z.infer<typeof orderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
