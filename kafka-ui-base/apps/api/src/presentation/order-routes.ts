import { prisma, type OrderWithEvents } from "@kafka-lab/shared";
import type { FastifyInstance, FastifyReply } from "fastify";
import type { CreateOrderUseCase } from "../application/create-order.js";

type CreateOrderBody = {
  customerEmail: string;
  productSku: string;
  quantity: number;
};

type BulkOrderBody = {
  amount: 100 | 1000 | 10000;
};

const isCreateOrderBody = (body: unknown): body is CreateOrderBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const candidate = body as Record<string, unknown>;

  return (
    typeof candidate.customerEmail === "string" &&
    typeof candidate.productSku === "string" &&
    typeof candidate.quantity === "number"
  );
};

const isBulkOrderBody = (body: unknown): body is BulkOrderBody => {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const amount = (body as Record<string, unknown>).amount;
  return amount === 100 || amount === 1000 || amount === 10000;
};

export const registerOrderRoutes = async (
  app: FastifyInstance,
  createOrderUseCase: CreateOrderUseCase
): Promise<void> => {
  app.post("/orders", async (request, reply) => {
    if (!isCreateOrderBody(request.body)) {
      return reply.status(400).send({ message: "Invalid body" });
    }

    const event = await createOrderUseCase.execute(request.body);

    return reply.status(201).send({
      order: event.order,
      eventId: event.eventId
    });
  });

  app.post("/orders/bulk", async (request, reply) => {
    if (!isBulkOrderBody(request.body)) {
      return reply.status(400).send({ message: "Amount must be 100, 1000 or 10000" });
    }

    const created = await createManyOrders(request.body.amount, createOrderUseCase);

    return reply.status(202).send({ created });
  });

  app.get("/orders", async () => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        events: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    return orders.map<OrderWithEvents>((order) => ({
      id: order.id,
      customerEmail: order.customerEmail,
      productSku: order.productSku,
      quantity: order.quantity,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      events: order.events.map((event) => ({
        id: event.id,
        orderId: event.orderId,
        stage: event.stage,
        service: event.service,
        status: event.status,
        message: event.message,
        topic: event.topic,
        partition: event.partition,
        offset: event.offset,
        kafkaTimestamp: event.kafkaTimestamp?.toISOString() ?? null,
        createdAt: event.createdAt.toISOString()
      }))
    }));
  });

  app.get("/events", async (request, reply) => {
    setupSse(reply);

    let lastSeen = new Date(0);

    const timer = setInterval(async () => {
      const events = await prisma.orderProcessingEvent.findMany({
        where: {
          createdAt: {
            gt: lastSeen
          }
        },
        orderBy: { createdAt: "asc" },
        take: 100
      });

      events.forEach((event) => {
        lastSeen = event.createdAt;
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      });
    }, 1000);

    request.raw.on("close", () => {
      clearInterval(timer);
    });
  });
};

const setupSse = (reply: FastifyReply): void => {
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  reply.raw.write("retry: 1000\n\n");
};

const createManyOrders = async (
  amount: BulkOrderBody["amount"],
  useCase: CreateOrderUseCase
): Promise<number> => {
  const skuList = ["BOOK-KAFKA", "TS-COURSE", "FASTIFY-MUG", "PRISMA-STICKER"];
  let created = 0;

  for (let index = 0; index < amount; index += 25) {
    const batch = Array.from({ length: Math.min(25, amount - index) }, (_, batchIndex) => {
      const current = index + batchIndex + 1;

      return useCase.execute({
        customerEmail: `cliente-${current}@example.com`,
        productSku: skuList[current % skuList.length] ?? "BOOK-KAFKA",
        quantity: (current % 5) + 1
      });
    });

    await Promise.all(batch);
    created += batch.length;
  }

  return created;
};
