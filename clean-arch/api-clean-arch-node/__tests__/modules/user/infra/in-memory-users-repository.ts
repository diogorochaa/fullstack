import { randomUUID } from "node:crypto";
import { User } from "../../../../src/modules/user/domain/entity/user";
import type {
  CreateUserRepositoryInput,
  UsersRepository,
} from "../../../../src/modules/user/domain/repository/users-repository";
import type { Email } from "../../../../src/modules/user/domain/value-objects/email";

export class InMemoryUsersRepository implements UsersRepository {
  private readonly users: User[] = [];

  async create(data: CreateUserRepositoryInput): Promise<User> {
    const now = new Date();
    const user = User.create({
      id: randomUUID(),
      name: data.name,
      email: data.email,
      createdAt: now,
      updatedAt: now,
    });

    this.users.push(user);

    return user;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.emailAddress.equals(email)) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async list(): Promise<User[]> {
    return [...this.users];
  }
}
