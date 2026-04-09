import { AuthCard, Input } from "@repo/ui";
import { Link } from "react-router";
import type { LoginPageActions } from "./actions";

type LoginPageViewProps = {
  ui: LoginPageActions;
};

export function LoginPageView({ ui }: LoginPageViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <AuthCard
          title={ui.title}
          subtitle={ui.subtitle}
          submitLabel={ui.isSubmitting ? "Entrando..." : ui.submitLabel}
          onSubmit={ui.onSubmit}
          footer={
            <>
              Nao possui conta?{" "}
              <Link to="/register" className="font-medium text-violet-700">
                Crie agora
              </Link>
            </>
          }
        >
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
