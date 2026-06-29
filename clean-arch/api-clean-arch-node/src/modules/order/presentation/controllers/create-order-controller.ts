import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateOrderUseCase } from "../../application/use-cases/create-order";
import { type CreateOrderInputDto, createOrderBodySchema } from "../schemas/create-order-schema";

export class CreateOrderController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input: CreateOrderInputDto = createOrderBodySchema.parse(request.body);
    const order = await this.createOrderUseCase.execute(input);

    return reply.status(201).send({ order });
  }
}
