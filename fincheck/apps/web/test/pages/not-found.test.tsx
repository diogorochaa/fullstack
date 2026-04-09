import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { useNotFoundPageActions } from "../../src/pages/not-found/actions";
import { NotFoundPageView } from "../../src/pages/not-found/view";

describe("not found page", () => {
  it("returns the expected copy", () => {
    expect(useNotFoundPageActions()).toEqual({
      title: "Pagina nao encontrada",
      description: "A rota acessada nao existe no aplicativo.",
      ctaLabel: "Voltar para Home",
    });
  });

  it("renders the view content", () => {
    render(
      <MemoryRouter>
        <NotFoundPageView
          ui={{
            title: "Pagina nao encontrada",
            description: "A rota acessada nao existe no aplicativo.",
            ctaLabel: "Voltar para Home",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Pagina nao encontrada")).toBeTruthy();
    expect(
      screen.getByText("A rota acessada nao existe no aplicativo."),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Voltar para Home" })
        .getAttribute("href"),
    ).toBe("/");
  });
});
