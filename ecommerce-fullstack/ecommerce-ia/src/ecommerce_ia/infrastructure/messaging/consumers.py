import asyncio
import contextlib
import json
import logging
from typing import Any

import aio_pika
from aiokafka import AIOKafkaConsumer

from ecommerce_ia.application.catalog_sync import CatalogSyncService
from ecommerce_ia.config.settings import Settings

logger = logging.getLogger(__name__)

PRODUCT_TOPICS = ("product.created", "product.updated", "product.deleted")
IA_REINDEX_QUEUE = "ia.reindex"


class MessagingConsumers:
    """Consumers Kafka + RabbitMQ que sincronizam o índice vetorial do catálogo."""

    def __init__(
        self,
        settings: Settings,
        catalog_sync: CatalogSyncService,
    ) -> None:
        self._settings = settings
        self._catalog_sync = catalog_sync
        self._kafka_task: asyncio.Task[None] | None = None
        self._rabbit_task: asyncio.Task[None] | None = None
        self._kafka_consumer: AIOKafkaConsumer | None = None
        self._rabbit_connection: aio_pika.RobustConnection | None = None

    async def start(self) -> None:
        self._kafka_task = asyncio.create_task(self._run_kafka_consumer())
        self._rabbit_task = asyncio.create_task(self._run_rabbit_consumer())
        logger.info("Messaging consumers started")

    async def stop(self) -> None:
        if self._kafka_consumer:
            await self._kafka_consumer.stop()
            self._kafka_consumer = None

        if self._rabbit_connection:
            await self._rabbit_connection.close()
            self._rabbit_connection = None

        for task in (self._kafka_task, self._rabbit_task):
            if task:
                task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await task

        logger.info("Messaging consumers stopped")

    async def _run_kafka_consumer(self) -> None:
        while True:
            try:
                self._kafka_consumer = AIOKafkaConsumer(
                    *PRODUCT_TOPICS,
                    bootstrap_servers=self._settings.kafka_brokers,
                    group_id="ecommerce-ia-catalog",
                    auto_offset_reset="earliest",
                )
                await self._kafka_consumer.start()
                logger.info(
                    "Kafka consumer connected",
                    extra={
                        "topic": ",".join(PRODUCT_TOPICS),
                        "event_type": "connected",
                    },
                )

                async for message in self._kafka_consumer:
                    await self._handle_kafka_message(message.topic, message.value)

            except asyncio.CancelledError:
                raise
            except Exception as error:
                logger.warning(
                    "Kafka consumer error — retrying in 5s",
                    extra={"event_type": "error", "error": str(error)},
                )
                await asyncio.sleep(5)

    async def _handle_kafka_message(self, topic: str, raw: bytes) -> None:
        try:
            event = json.loads(raw.decode())
            payload = event.get("payload", event)
            product_id = payload.get("id")

            if not product_id:
                return

            if topic == "product.deleted":
                await self._catalog_sync.remove_product(product_id)
            else:
                await self._catalog_sync.upsert_product(product_id)

            logger.info(
                "Kafka message consumed",
                extra={"topic": topic, "event_type": topic, "product_id": product_id},
            )
        except Exception as error:
            logger.error(
                "Failed to handle Kafka message",
                extra={"topic": topic, "event_type": "error", "error": str(error)},
            )

    async def _run_rabbit_consumer(self) -> None:
        while True:
            try:
                self._rabbit_connection = await aio_pika.connect_robust(
                    self._settings.rabbitmq_url
                )
                channel = await self._rabbit_connection.channel()
                queue = await channel.declare_queue(IA_REINDEX_QUEUE, durable=True)

                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        async with message.process():
                            await self._handle_rabbit_message(
                                json.loads(message.body.decode())
                            )

            except asyncio.CancelledError:
                raise
            except Exception as error:
                logger.warning(
                    "RabbitMQ consumer error — retrying in 5s",
                    extra={
                        "queue": IA_REINDEX_QUEUE,
                        "event_type": "error",
                        "error": str(error),
                    },
                )
                await asyncio.sleep(5)

    async def _handle_rabbit_message(self, payload: dict[str, Any]) -> None:
        action = payload.get("action", "upsert")
        product_id = payload.get("productId")

        if action == "full":
            count = await self._catalog_sync.reindex_full()
            logger.info(
                "RabbitMQ message consumed",
                extra={
                    "queue": IA_REINDEX_QUEUE,
                    "event_type": "catalog.full_reindex",
                    "products_indexed": count,
                },
            )
            return

        if not product_id:
            return

        if action == "delete":
            await self._catalog_sync.remove_product(product_id)
        else:
            await self._catalog_sync.upsert_product(product_id)

        logger.info(
            "RabbitMQ message consumed",
            extra={
                "queue": IA_REINDEX_QUEUE,
                "event_type": f"catalog.{action}",
                "product_id": product_id,
            },
        )
