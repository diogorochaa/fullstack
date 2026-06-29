import { prisma } from "../../../../infra/database/prisma";
import type { User } from "../../domain/entity/user";
import type {
  CreateUserRepositoryInput,
  UsersRepository,
} from "../../domain/repository/users-repository";
import type { Email } from "../../domain/value-objects/email";
import { prismaUserToDomain, userToPrismaCreate } from "./mappers/prisma-user-mapper";

export class PrismaUsersRepository implements UsersRepository {
  async create(data: CreateUserRepositoryInput): Promise<User> {
    const user = await prisma.user.create({
      data: userToPrismaCreate(data),
    });

    return prismaUserToDomain(user);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email: email.value,
      },
    });

    return user ? prismaUserToDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user ? prismaUserToDomain(user) : null;
  }

  async list(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => prismaUserToDomain(user));
  }
}
