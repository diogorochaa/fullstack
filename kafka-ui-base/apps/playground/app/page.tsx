"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type ProcessingEvent = {
  id: string;
  orderId: string | null;
  stage: string;
  service: string;
  status: string;
  message: string;
  topic: string | null;
  partition: number | null;
  offset: string | null;
  kafkaTimestamp: string | null;
  createdAt: string;
};

type Order = {
  id: string;
  customerEmail: string;
  productSku: string;
  quantity: number;
  status: string;
  createdAt: string;
  events: ProcessingEvent[];
};

const stages = [
  "ORDER_CREATED",
  "EVENT_PUBLISHED",
  "EMAIL_PROCESSED",
  "STOCK_UPDATED",
  "ANALYTICS_COMPLETED"
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isProcessingEvent = (value: unknown): value is ProcessingEvent => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    (typeof value.orderId === "string" || value.orderId === null) &&
    typeof value.stage === "string" &&
    typeof value.service === "string" &&
    typeof value.status === "string" &&
    typeof value.message === "string" &&
    (typeof value.topic === "string" || value.topic === null) &&
    (typeof value.partition === "number" || value.partition === null) &&
    (typeof value.offset === "string" || value.offset === null) &&
    (typeof value.kafkaTimestamp === "string" || value.kafkaTimestamp === null) &&
    typeof value.createdAt === "string"
  );
};

const isOrder = (value: unknown): value is Order => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.customerEmail === "string" &&
    typeof value.productSku === "string" &&
    typeof value.quantity === "number" &&
    typeof value.status === "string" &&
    typeof value.createdAt === "string" &&
    Array.isArray(value.events) &&
    value.events.every(isProcessingEvent)
  );
};

const isOrderList = (value: unknown): value is Order[] =>
  Array.isArray(value) && value.every(isOrder);

export default function KafkaPlaygroundPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<ProcessingEvent[]>([]);
  const [customerEmail, setCustomerEmail] = useState("cliente@example.com");
  const [productSku, setProductSku] = useState("BOOK-KAFKA");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const failedEvents = useMemo(
    () => events.filter((event) => event.stage === "DLQ_PUBLISHED" || event.status === "failed"),
    [events]
  );

  const refreshOrders = async (): Promise<void> => {
    try {
      const response = await fetch(`${apiUrl}/orders`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`API respondeu ${response.status}`);
      }

      const data = (await response.json()) as unknown;

      if (!isOrderList(data)) {
        throw new Error("Resposta inesperada de /orders");
      }

      setOrders(data);
      setApiError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao buscar pedidos";
      setApiError(`${message}. Confira se a API esta rodando em ${apiUrl}.`);
      setOrders([]);
    }
  };

  useEffect(() => {
    void refreshOrders();

    const source = new EventSource(`${apiUrl}/events`);

    source.onmessage = (message) => {
      const event = JSON.parse(message.data) as unknown;

      if (!isProcessingEvent(event)) {
        return;
      }

      setEvents((current) => [event, ...current].slice(0, 100));
      void refreshOrders();
    };

    return () => {
      source.close();
    };
  }, []);

  const createOrder = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerEmail,
          productSku,
          quantity
        })
      });

      if (!response.ok) {
        throw new Error(`API respondeu ${response.status}`);
      }

      await refreshOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao criar pedido";
      setApiError(`${message}. Confira se a API esta rodando em ${apiUrl}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateBulk = async (amount: 100 | 1000 | 10000): Promise<void> => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/orders/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        throw new Error(`API respondeu ${response.status}`);
      }

      await refreshOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao gerar pedidos";
      setApiError(`${message}. Confira se a API esta rodando em ${apiUrl}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Apache Kafka Lab</p>
          <h1>Kafka Playground</h1>
          <p>
            Crie pedidos, acompanhe eventos em tempo real por SSE e confira particao, offset,
            timestamp, retry e DLQ enquanto os workers processam em paralelo.
          </p>
        </div>
        <a href="http://localhost:8080" target="_blank" rel="noreferrer" className="kafkaUiLink">
          Abrir Kafka UI
        </a>
      </section>

      <section className="grid">
        <form className="card" onSubmit={(event) => void createOrder(event)}>
          <h2>Criar pedido</h2>
          <label>
            Email do cliente
            <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
          </label>
          <label>
            SKU do produto
            <input value={productSku} onChange={(event) => setProductSku(event.target.value)} />
          </label>
          <label>
            Quantidade
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </label>
          <button disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Criar pedido"}</button>
          <p className="hint">
            Use SKUs <code>FAIL_EMAIL</code>, <code>FAIL_STOCK</code> ou{" "}
            <code>FAIL_ANALYTICS</code> para ver retry e DLQ.
          </p>
        </form>

        <div className="card">
          <h2>Carga</h2>
          <p>Gere muitos pedidos para observar throughput, lag, offsets e distribuicao em particoes.</p>
          <div className="buttonRow">
            {[100, 1000, 10000].map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isSubmitting}
                onClick={() => void generateBulk(amount as 100 | 1000 | 10000)}
              >
                Gerar {amount.toLocaleString("pt-BR")}
              </button>
            ))}
          </div>
        </div>

        <div className={`card ${failedEvents.length > 0 ? "danger" : ""}`}>
          <h2>DLQ e falhas</h2>
          <strong>{failedEvents.length}</strong>
          <p>Eventos com falha aparecem destacados aqui e tambem no historico ao vivo.</p>
        </div>
      </section>

      <section className="card">
        <h2>Pedidos salvos no PostgreSQL</h2>
        {apiError ? <p className="errorMessage">{apiError}</p> : null}
        <div className="orders">
          {orders.map((order) => (
            <article key={order.id} className="order">
              <header>
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.customerEmail}</span>
                </div>
                <span className="pill">{order.status}</span>
              </header>
              <p>
                SKU {order.productSku} · Quantidade {order.quantity}
              </p>
              <div className="timeline">
                {stages.map((stage) => {
                  const done = order.events.some((event) => event.stage === stage);
                  return (
                    <span key={stage} className={done ? "step done" : "step"}>
                      {stage.replaceAll("_", " ")}
                    </span>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Eventos em tempo real</h2>
        <div className="eventList">
          {events.map((event) => (
            <article
              key={event.id}
              className={`event ${event.stage === "DLQ_PUBLISHED" || event.status === "failed" ? "failed" : ""}`}
            >
              <header>
                <strong>{event.stage}</strong>
                <span>{event.service}</span>
              </header>
              <p>{event.message}</p>
              <dl>
                <div>
                  <dt>Pedido</dt>
                  <dd>{event.orderId ?? "-"}</dd>
                </div>
                <div>
                  <dt>Topico</dt>
                  <dd>{event.topic ?? "-"}</dd>
                </div>
                <div>
                  <dt>Particao</dt>
                  <dd>{event.partition ?? "-"}</dd>
                </div>
                <div>
                  <dt>Offset</dt>
                  <dd>{event.offset ?? "-"}</dd>
                </div>
                <div>
                  <dt>Timestamp</dt>
                  <dd>{event.kafkaTimestamp ?? event.createdAt}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
