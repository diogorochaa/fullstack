import { Input } from "@repo/ui";

export default {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
};

export const Default = {
  render: () => (
    <div className="max-w-md">
      <Input>
        <Input.Label>Email</Input.Label>
        <Input.Field type="email" placeholder="voce@email.com" />
        <Input.Helper>Use o mesmo email da conta.</Input.Helper>
      </Input>
    </div>
  ),
};

export const Password = {
  render: () => (
    <div className="max-w-md">
      <Input>
        <Input.Label>Senha</Input.Label>
        <Input.Field type="password" placeholder="********" />
      </Input>
    </div>
  ),
};
