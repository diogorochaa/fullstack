import { httpClient } from "@/shared/api/http-client";
import {
  type CreateProductInput,
  createProductSchema,
  type Product,
  productResponseSchema,
} from "./product.schemas";

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const payload = createProductSchema.parse(input);
  const response = await httpClient<unknown>("/products", {
    method: "POST",
    body: payload,
  });

  return productResponseSchema.parse(response).product;
}
