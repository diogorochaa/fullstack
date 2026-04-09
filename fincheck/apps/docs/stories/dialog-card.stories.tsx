import { DialogCard, Input } from "@repo/ui";

export default {
  title: "UI/DialogCard",
  component: DialogCard,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export const Default = {
  render: () => (
    <DialogCard title="Nova Receita" actionLabel="Salvar" onClose={() => {}}>
      <Input>
        <Input.Label>Nome</Input.Label>
        <Input.Field type="text" placeholder="Digite um nome" />
      </Input>
      <Input>
        <Input.Label>Valor</Input.Label>
        <Input.Field type="text" placeholder="R$ 0,00" />
      </Input>
    </DialogCard>
  ),
};
