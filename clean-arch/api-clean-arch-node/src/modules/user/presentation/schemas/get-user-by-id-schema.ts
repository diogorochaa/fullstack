import { z } from "zod";

export const getUserByIdParamsSchema = z.object({
  id: z.uuid(),
});

export type GetUserByIdInputDto = z.infer<typeof getUserByIdParamsSchema>;
