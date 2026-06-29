import { CalendarDays, Mail, UserRound } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useUserByIdQuery } from "../hooks/use-users";

type UserDetailsCardProps = {
  userId: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function UserDetailsCard({ userId }: UserDetailsCardProps) {
  const { data: user, error, isFetching } = useUserByIdQuery(userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes</CardTitle>
        <CardDescription>Consulta individual usando `GET /users/:id`.</CardDescription>
      </CardHeader>
      <CardContent>
        {!userId ? (
          <p className="text-sm text-muted-foreground">
            Selecione um usuário na lista para ver os detalhes.
          </p>
        ) : null}

        {isFetching ? <UserDetailsSkeleton /> : null}

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        {user && !isFetching ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="break-all text-muted-foreground text-sm">{user.id}</p>
              </div>
              <Badge variant="secondary">Ativo</Badge>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4" />
                <span>Criado em {dateFormatter.format(user.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRound className="size-4" />
                <span>Atualizado em {dateFormatter.format(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
