import { Loader2, Plus } from "lucide-react";
import { type SubmitEvent, useState } from "react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
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
import { type CreateUserInput, createUserSchema } from "../api/user.schemas";
import { useCreateUserMutation } from "../hooks/use-users";

const initialForm: CreateUserInput = {
  name: "",
  email: "",
};

export function CreateUserForm() {
  const [form, setForm] = useState<CreateUserInput>(initialForm);
  const [validationError, setValidationError] = useState<string | null>(null);
  const createUser = useCreateUserMutation();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    try {
      const payload = createUserSchema.parse(form);
      await createUser.mutateAsync(payload);
      setForm(initialForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.issues[0]?.message ?? "Revise os dados informados.");
        return;
      }
    }
  }

  const errorMessage = validationError ?? createUser.error?.message;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo usuário</CardTitle>
        <CardDescription>Crie usuários consumindo o endpoint `POST /users`.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              placeholder="ada@example.com"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <Button className="w-full" disabled={createUser.isPending} type="submit">
            {createUser.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Criar usuário
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
