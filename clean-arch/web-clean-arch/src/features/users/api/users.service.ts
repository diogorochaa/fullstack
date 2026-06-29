import { httpClient } from "@/shared/api/http-client";
import {
  type CreateUserInput,
  createUserSchema,
  type User,
  userResponseSchema,
  usersResponseSchema,
} from "./user.schemas";

export async function listUsers(): Promise<User[]> {
  const response = await httpClient<unknown>("/users");

  return usersResponseSchema.parse(response).users;
}

export async function getUserById(id: string): Promise<User> {
  const response = await httpClient<unknown>(`/users/${id}`);

  return userResponseSchema.parse(response).user;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const payload = createUserSchema.parse(input);
  const response = await httpClient<unknown>("/users", {
    method: "POST",
    body: payload,
  });

  return userResponseSchema.parse(response).user;
}
