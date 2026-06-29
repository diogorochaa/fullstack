import { useMutation } from "@tanstack/react-query";
import type { CreateOrderInput } from "../api/order.schemas";
import { createOrder } from "../api/orders.service";

export const ordersQueryKeys = {
  all: ["orders"] as const,
};

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
  });
}
