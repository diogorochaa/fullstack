import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateUserUseCase } from "../../application/use-cases/create-user";
import { type CreateUserInputDto, createUserBodySchema } from "../schemas/create-user-schema";

export class CreateUserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input: CreateUserInputDto = createUserBodySchema.parse(request.body);
    const user = await this.createUserUseCase.execute(input);

    return reply.status(201).send({ user });
  }
}
