import { z } from "zod";

export const createProductBodySchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export type CreateProductInputDto = z.infer<typeof createProductBodySchema>;
