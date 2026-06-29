import type { User } from "../entity/user";
import type { Email } from "../value-objects/email";

export type CreateUserRepositoryInput = {
  name: string;
  email: Email;
};

export interface UsersRepository {
  create(data: CreateUserRepositoryInput): Promise<User>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  list(): Promise<User[]>;
}
