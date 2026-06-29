import { UsersRound } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";

export function UsersEmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-full bg-muted p-3">
          <UsersRound className="size-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">Nenhum usuário encontrado</h3>
          <p className="text-muted-foreground text-sm">
            Use o formulário para criar o primeiro usuário da base.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
