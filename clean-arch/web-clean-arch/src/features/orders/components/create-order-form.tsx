import { Loader2, ShoppingCart } from "lucide-react";
import { type SubmitEvent, useState } from "react";
import { z } from "zod";
import { useUsersQuery } from "@/features/users/hooks/use-users";
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
import { createOrderSchema } from "../api/order.schemas";
import { useCreateOrderMutation } from "../hooks/use-orders";

type CreateOrderFormProps = {
  selectedUserId: string | null;
  suggestedProductId: string | null;
};

type OrderFormState = {
  userId: string;
  productId: string;
  quantity: string;
};

function createInitialForm(
  selectedUserId: string | null,
  suggestedProductId: string | null,
): OrderFormState {
  return {
    userId: selectedUserId ?? "",
    productId: suggestedProductId ?? "",
    quantity: "1",
  };
}

const quantityOnlyInitialForm = {
  quantity: "1",
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

export function CreateOrderForm({ selectedUserId, suggestedProductId }: CreateOrderFormProps) {
  const [form, setForm] = useState<OrderFormState>(() =>
    createInitialForm(selectedUserId, suggestedProductId),
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const usersQuery = useUsersQuery();
  const createOrder = useCreateOrderMutation();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    try {
      await createOrder.mutateAsync(createOrderSchema.parse(form));
      setForm((current) => ({ ...current, ...quantityOnlyInitialForm }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.issues[0]?.message ?? "Revise os dados do pedido.");
      }
    }
  }

  const users = usersQuery.data ?? [];
  const errorMessage = validationError ?? createOrder.error?.message ?? usersQuery.error?.message;
  const createdOrder = createOrder.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo pedido</CardTitle>
        <CardDescription>
          Crie pedidos por `POST /orders`. O preço vem do produto no backend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="order-user">Usuário</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={usersQuery.isLoading}
              id="order-user"
              name="userId"
              value={form.userId}
              onChange={(event) =>
                setForm((current) => ({ ...current, userId: event.target.value }))
              }
            >
              <option value="">Selecione um usuário</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-product">Produto</Label>
            <Input
              id="order-product"
              name="productId"
              placeholder="UUID do produto"
              value={form.productId}
              onChange={(event) =>
                setForm((current) => ({ ...current, productId: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-quantity">Quantidade</Label>
            <Input
              id="order-quantity"
              min="1"
              name="quantity"
              step="1"
              type="number"
              value={form.quantity}
              onChange={(event) =>
                setForm((current) => ({ ...current, quantity: event.target.value }))
              }
            />
          </div>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          {createdOrder ? (
            <Alert>
              <AlertDescription className="space-y-2">
                <p>
                  Pedido criado com total de{" "}
                  <strong>{currencyFormatter.format(createdOrder.total)}</strong>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Qtd: {createdOrder.quantity}</Badge>
                  <Badge variant="outline">
                    Preço: {currencyFormatter.format(createdOrder.price)}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          <Button
            className="w-full"
            disabled={createOrder.isPending || usersQuery.isLoading}
            type="submit"
          >
            {createOrder.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            Criar pedido
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
