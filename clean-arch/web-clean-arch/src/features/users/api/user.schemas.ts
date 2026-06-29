import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const usersResponseSchema = z.object({
  users: z.array(userSchema),
});

export const userResponseSchema = z.object({
  user: userSchema,
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do usuário."),
  email: z.email("Informe um e-mail válido."),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
