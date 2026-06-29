import type { FastifyInstance } from "fastify";
import { CreateUserUseCase } from "../../../../modules/user/application/use-cases/create-user";
import { GetUserByIdUseCase } from "../../../../modules/user/application/use-cases/get-user-by-id";
import { ListUsersUseCase } from "../../../../modules/user/application/use-cases/list-users";
import { PrismaUsersRepository } from "../../../../modules/user/infra/prisma/prisma-users-repository";
import { CreateUserController } from "../../../../modules/user/presentation/controllers/create-user-controller";
import { GetUserByIdController } from "../../../../modules/user/presentation/controllers/get-user-by-id-controller";
import { ListUsersController } from "../../../../modules/user/presentation/controllers/list-users-controller";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const usersRepository = new PrismaUsersRepository();

  const createUserController = new CreateUserController(new CreateUserUseCase(usersRepository));
  const getUserByIdController = new GetUserByIdController(new GetUserByIdUseCase(usersRepository));
  const listUsersController = new ListUsersController(new ListUsersUseCase(usersRepository));

  app.post("/users", createUserController.handle.bind(createUserController));
  app.get("/users", listUsersController.handle.bind(listUsersController));
  app.get("/users/:id", getUserByIdController.handle.bind(getUserByIdController));
}
