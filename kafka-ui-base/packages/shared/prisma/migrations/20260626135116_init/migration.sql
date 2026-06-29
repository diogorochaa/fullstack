-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'EVENT_PUBLISHED', 'EMAIL_PROCESSED', 'STOCK_UPDATED', 'ANALYTICS_COMPLETED', 'DLQ_FAILED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderProcessingEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "stage" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "topic" TEXT,
    "partition" INTEGER,
    "offset" TEXT,
    "kafkaTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderProcessingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedMessage" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "partition" INTEGER NOT NULL,
    "offset" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderProcessingEvent_orderId_createdAt_idx" ON "OrderProcessingEvent"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderProcessingEvent_stage_createdAt_idx" ON "OrderProcessingEvent"("stage", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedMessage_service_eventId_key" ON "ProcessedMessage"("service", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsMetric_name_key" ON "AnalyticsMetric"("name");

-- AddForeignKey
ALTER TABLE "OrderProcessingEvent" ADD CONSTRAINT "OrderProcessingEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
