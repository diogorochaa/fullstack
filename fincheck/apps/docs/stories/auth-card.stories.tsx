import { AuthCard, Input } from "@repo/ui";

export default {
  title: "UI/AuthCard",
  component: AuthCard,
  tags: ["autodocs"],
};

export const Default = {
  render: () => (
    <div className="flex min-h-130 items-center justify-center">
      <AuthCard
        title="Acesse sua conta"
        subtitle="Entre para acompanhar suas financas no Fincheck"
        submitLabel="Entrar"
        footer="Nao possui conta? Crie agora"
      >
        <Input>
          <Input.Label>Email</Input.Label>
          <Input.Field type="email" placeholder="voce@email.com" />
        </Input>
        <Input>
          <Input.Label>Senha</Input.Label>
          <Input.Field type="password" placeholder="********" />
        </Input>
      </AuthCard>
    </div>
  ),
};
