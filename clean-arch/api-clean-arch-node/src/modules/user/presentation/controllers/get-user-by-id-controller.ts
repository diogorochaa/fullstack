import type { FastifyReply, FastifyRequest } from "fastify";
import type { GetUserByIdUseCase } from "../../application/use-cases/get-user-by-id";
import {
  type GetUserByIdInputDto,
  getUserByIdParamsSchema,
} from "../schemas/get-user-by-id-schema";

export class GetUserByIdController {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id }: GetUserByIdInputDto = getUserByIdParamsSchema.parse(request.params);
    const user = await this.getUserByIdUseCase.execute({ id });

    return reply.send({ user });
  }
}
