import { Loader2, PackagePlus } from "lucide-react";
import { type SubmitEvent, useState } from "react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { createProductSchema, type Product } from "../api/product.schemas";
import { useCreateProductMutation } from "../hooks/use-products";

type CreateProductFormProps = {
  onProductCreated?: (product: Product) => void;
};

type ProductFormState = {
  name: string;
  price: string;
};

const initialForm: ProductFormState = {
  name: "",
  price: "",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

export function CreateProductForm({ onProductCreated }: CreateProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [validationError, setValidationError] = useState<string | null>(null);
  const createProduct = useCreateProductMutation();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    try {
      const product = await createProduct.mutateAsync(createProductSchema.parse(form));
      setForm(initialForm);
      onProductCreated?.(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.issues[0]?.message ?? "Revise os dados do produto.");
      }
    }
  }

  const errorMessage = validationError ?? createProduct.error?.message;
  const createdProduct = createProduct.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo produto</CardTitle>
        <CardDescription>Crie produtos consumindo o endpoint `POST /products`.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome</Label>
            <Input
              id="product-name"
              name="name"
              placeholder="Livro Clean Architecture"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">Preço</Label>
            <Input
              id="product-price"
              min="0"
              name="price"
              placeholder="99.90"
              step="0.01"
              type="number"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
            />
          </div>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {createdProduct ? (
            <Alert>
              <AlertDescription className="space-y-2">
                <p>
                  Produto criado: <strong>{createdProduct.name}</strong>{" "}
                  {currencyFormatter.format(createdProduct.price)}
                </p>
                <Badge className="break-all" variant="secondary">
                  {createdProduct.id}
                </Badge>
              </AlertDescription>
            </Alert>
          ) : null}

          <Button className="w-full" disabled={createProduct.isPending} type="submit">
            {createProduct.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PackagePlus className="size-4" />
            )}
            Criar produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
