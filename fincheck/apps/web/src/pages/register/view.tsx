import { AuthCard, Input } from "@repo/ui";
import { Link } from "react-router";
import type { RegisterPageActions } from "./actions";

type RegisterPageViewProps = {
  ui: RegisterPageActions;
};

export function RegisterPageView({ ui }: RegisterPageViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <AuthCard
          title={ui.title}
          subtitle={ui.subtitle}
          submitLabel={ui.isSubmitting ? "Cadastrando..." : ui.submitLabel}
          onSubmit={ui.onSubmit}
          footer={
            <>
              Ja tem conta?{" "}
              <Link to="/login" className="font-medium text-violet-700">
                Entrar
              </Link>
            </>
          }
        >
          <Input>
            <Input.Label>Nome</Input.Label>
            <Input.Field
              type="text"
              placeholder="Seu nome"
              aria-invalid={ui.errors.name ? "true" : "false"}
              {...ui.register("name")}
            />
            {ui.errors.name ? (
              <Input.Helper className="text-red-600">
                {ui.errors.name.message}
              </Input.Helper>
            ) : null}
          </Input>
          <Input>
            <Input.Label>Email</Input.Label>
            <Input.Field
              type="email"
              placeholder="voce@email.com"
              aria-invalid={ui.errors.email ? "true" : "false"}
              {...ui.register("email")}
            />
            {ui.errors.email ? (
              <Input.Helper className="text-red-600">
                {ui.errors.email.message}
              </Input.Helper>
            ) : null}
          </Input>
          <Input>
            <Input.Label>Senha</Input.Label>
            <Input.Field
              type="password"
              placeholder="********"
              aria-invalid={ui.errors.password ? "true" : "false"}
              {...ui.register("password")}
            />
            {ui.errors.password ? (
              <Input.Helper className="text-red-600">
                {ui.errors.password.message}
              </Input.Helper>
            ) : null}
          </Input>
          {ui.requestError ? (
            <Input.Helper className="text-red-600">
              {ui.requestError}
            </Input.Helper>
          ) : null}
        </AuthCard>
      </div>
    </div>
  );
}
