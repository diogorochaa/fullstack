import type { FastifyReply, FastifyRequest } from "fastify";
import type { ListUsersUseCase } from "../../application/use-cases/list-users";

export class ListUsersController {
  constructor(private readonly listUsersUseCase: ListUsersUseCase) {}

  async handle(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const users = await this.listUsersUseCase.execute();

    return reply.send({
      users,
    });
  }
}
