import { z } from "zod";

export const createUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
});

export type CreateUserInputDto = z.infer<typeof createUserBodySchema>;
