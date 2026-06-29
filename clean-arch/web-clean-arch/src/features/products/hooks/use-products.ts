import { useMutation } from "@tanstack/react-query";
import type { CreateProductInput } from "../api/product.schemas";
import { createProduct } from "../api/products.service";

export const productsQueryKeys = {
  all: ["products"] as const,
};

export function useCreateProductMutation() {
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
  });
}
