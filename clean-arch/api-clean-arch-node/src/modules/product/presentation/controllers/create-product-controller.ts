import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateProductUseCase } from "../../application/use-cases/create-product";
import {
  type CreateProductInputDto,
  createProductBodySchema,
} from "../schemas/create-product-schema";

export class CreateProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input: CreateProductInputDto = createProductBodySchema.parse(request.body);
    const product = await this.createProductUseCase.execute(input);

    return reply.status(201).send({ product });
  }
}
