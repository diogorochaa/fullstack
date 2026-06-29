import { z } from "zod";

export const createOrderBodySchema = z.object({
  userId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().positive(),
});

export type CreateOrderInputDto = z.infer<typeof createOrderBodySchema>;
