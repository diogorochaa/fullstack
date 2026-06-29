import { User } from "../../../domain/entity/user";
import { Email } from "../../../domain/value-objects/email";

export type PrismaUserModel = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export function prismaUserToDomain(user: PrismaUserModel): User {
  return User.create({
    id: user.id,
    name: user.name,
    email: Email.create(user.email),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export function userToPrismaCreate(user: { name: string; email: Email }): {
  name: string;
  email: string;
} {
  return {
    name: user.name,
    email: user.email.value,
  };
}
