import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import { fastifyErrorHandler } from "./errors/fastify-error-handler";
import { orderRoutes } from "./routes/order-routes";
import { productRoutes } from "./routes/product-route";
import { userRoutes } from "./routes/user-routes";

export const fastify = Fastify({
  logger: true,
});

fastify.setErrorHandler(fastifyErrorHandler);

fastify.register(cors, {
  origin: "*",
});

fastify.register(helmet);
fastify.register(userRoutes);
fastify.register(orderRoutes);
fastify.register(productRoutes);

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is running on ${address}`);
});
