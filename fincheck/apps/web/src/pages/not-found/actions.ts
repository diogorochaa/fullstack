export type NotFoundPageActions = {
  title: string;
  description: string;
  ctaLabel: string;
};

export function useNotFoundPageActions(): NotFoundPageActions {
  return {
    title: "Pagina nao encontrada",
    description: "A rota acessada nao existe no aplicativo.",
    ctaLabel: "Voltar para Home",
  };
}
