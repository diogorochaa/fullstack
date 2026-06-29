import { httpClient } from "@/shared/api/http-client";
import {
  type CreateOrderInput,
  createOrderSchema,
  type Order,
  orderResponseSchema,
} from "./order.schemas";

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const payload = createOrderSchema.parse(input);
  const response = await httpClient<unknown>("/orders", {
    method: "POST",
    body: payload,
  });

  return orderResponseSchema.parse(response).order;
}
