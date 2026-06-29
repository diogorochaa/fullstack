import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { InvalidOrderPriceError } from "../../../../modules/order/domain/errors/invalid-order-price-error";
import { InvalidOrderQuantityError } from "../../../../modules/order/domain/errors/invalid-order-quantity-error";
import { ProductNotFoundError } from "../../../../modules/product/application/errors/product-not-found-error";
import { InvalidProductNameError } from "../../../../modules/product/domain/errors/invalid-product-name-error";
import { InvalidProductPriceError } from "../../../../modules/product/domain/errors/invalid-product-price-error";
import { EmailAlreadyInUseError } from "../../../../modules/user/application/errors/email-already-in-use-error";
import { UserNotFoundError } from "../../../../modules/user/application/errors/user-not-found-error";
import { InvalidEmailError } from "../../../../modules/user/domain/errors/invalid-email-error";

export function fastifyErrorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: "Validation error.",
      issues: error.issues,
    });
    return;
  }

  if (error instanceof InvalidEmailError) {
    reply.status(400).send({
      message: "Invalid email.",
    });
    return;
  }

  if (error instanceof InvalidOrderQuantityError || error instanceof InvalidOrderPriceError) {
    reply.status(400).send({
      message: "Invalid order.",
    });
    return;
  }

  if (error instanceof InvalidProductNameError || error instanceof InvalidProductPriceError) {
    reply.status(400).send({
      message: "Invalid product.",
    });
    return;
  }

  if (error instanceof EmailAlreadyInUseError) {
    reply.status(409).send({
      message: "Email already in use.",
    });
    return;
  }

  if (error instanceof UserNotFoundError) {
    reply.status(404).send({
      message: "User not found.",
    });
    return;
  }

  if (error instanceof ProductNotFoundError) {
    reply.status(404).send({
      message: "Product not found.",
    });
    return;
  }

  request.log.error(error);

  reply.status(500).send({
    message: "Internal server error.",
  });
}
