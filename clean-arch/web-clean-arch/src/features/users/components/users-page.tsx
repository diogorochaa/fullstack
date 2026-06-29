import { RefreshCcw, Server, UsersRound } from "lucide-react";
import { useState } from "react";
import { CreateOrderForm } from "@/features/orders/components/create-order-form";
import type { Product } from "@/features/products/api/product.schemas";
import { CreateProductForm } from "@/features/products/components/create-product-form";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { env } from "@/shared/config/env";
import { cn } from "@/shared/lib/utils";
import type { User } from "../api/user.schemas";
import { useUsersQuery } from "../hooks/use-users";
import { CreateUserForm } from "./create-user-form";
import { UserDetailsCard } from "./user-details-card";
import { UsersEmptyState } from "./users-empty-state";

const usersSkeletonRows = ["first-user-skeleton", "second-user-skeleton", "third-user-skeleton"];

export function UsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [lastCreatedProductId, setLastCreatedProductId] = useState<string | null>(null);
  const usersQuery = useUsersQuery();
  const users = usersQuery.data ?? [];

  function handleSelectUser(user: User) {
    setSelectedUserId(user.id);
  }

  function handleProductCreated(product: Product) {
    setLastCreatedProductId(product.id);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Badge className="w-fit gap-1" variant="secondary">
            <Server className="size-3" />
            API: {env.apiBaseUrl}
          </Badge>
          <div>
            <h1 className="font-bold text-3xl tracking-tight sm:text-4xl">Gestão Clean Arch</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Front em Vite consumindo usuários, produtos e pedidos da API Node com TanStack Query,
              shadcn/ui, Zod e features separadas por módulo.
            </p>
          </div>
        </div>
        <Button
          disabled={usersQuery.isFetching}
          onClick={() => usersQuery.refetch()}
          variant="outline"
        >
          <RefreshCcw className={cn("size-4", usersQuery.isFetching && "animate-spin")} />
          Atualizar
        </Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UsersRound className="size-5" />
                    Usuários
                  </CardTitle>
                  <CardDescription>Listagem carregada por `GET /users`.</CardDescription>
                </div>
                <Badge variant="outline">{users.length} cadastrados</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {usersQuery.isLoading ? <UsersListSkeleton /> : null}

              {usersQuery.error ? (
                <Alert variant="destructive">
                  <AlertTitle>Erro ao buscar usuários</AlertTitle>
                  <AlertDescription>{usersQuery.error.message}</AlertDescription>
                </Alert>
              ) : null}

              {!usersQuery.isLoading && !usersQuery.error && users.length === 0 ? (
                <UsersEmptyState />
              ) : null}

              {users.length > 0 ? (
                <div className="grid gap-3">
                  {users.map((user) => (
                    <button
                      className={cn(
                        "rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent",
                        selectedUserId === user.id && "border-primary bg-accent",
                      )}
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      type="button"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="break-all text-muted-foreground text-sm">{user.email}</p>
                        </div>
                        <Badge className="mt-2 sm:mt-0" variant="secondary">
                          Ver detalhes
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <CreateUserForm />
        <UserDetailsCard userId={selectedUserId} />
        <CreateProductForm onProductCreated={handleProductCreated} />
        <CreateOrderForm
          key={`${selectedUserId ?? "no-user"}-${lastCreatedProductId ?? "no-product"}`}
          selectedUserId={selectedUserId}
          suggestedProductId={lastCreatedProductId}
        />

      </section>
    </main>
  );
}

function UsersListSkeleton() {
  return (
    <div className="grid gap-3">
      {usersSkeletonRows.map((row) => (
        <div className="rounded-lg border p-4" key={row}>
          <Skeleton className="mb-2 h-5 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      ))}
    </div>
  );
}
