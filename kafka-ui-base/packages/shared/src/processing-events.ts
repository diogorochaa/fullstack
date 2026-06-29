import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import type { KafkaMessageMetadata, ProcessingStage, ProcessingStatus } from "./types.js";

type RecordProcessingEventInput = {
  orderId?: string;
  stage: ProcessingStage;
  service: string;
  status: ProcessingStatus;
  message: string;
  metadata?: KafkaMessageMetadata;
  nextOrderStatus?: OrderStatus;
};

export const recordProcessingEvent = async (input: RecordProcessingEventInput): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const data: Prisma.OrderProcessingEventCreateInput = {
      stage: input.stage,
      service: input.service,
      status: input.status,
      message: input.message
    };

    if (input.orderId) {
      data.order = {
        connect: {
          id: input.orderId
        }
      };
    }

    if (input.metadata) {
      data.topic = input.metadata.topic;
      data.partition = input.metadata.partition;
      data.offset = input.metadata.offset;
      data.kafkaTimestamp = new Date(input.metadata.timestamp);
    }

    await tx.orderProcessingEvent.create({
      data
    });

    if (input.orderId && input.nextOrderStatus) {
      await tx.order.update({
        where: { id: input.orderId },
        data: { status: input.nextOrderStatus }
      });
    }
  });
};
