import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { LoginPageView } from "../../src/pages/login/view";

describe("login page view", () => {
  it("renders the submitting state and api error", () => {
    render(
      <MemoryRouter>
        <LoginPageView
          ui={{
            title: "Acesse sua conta",
            subtitle: "Entre para acompanhar suas financas no Fincheck",
            submitLabel: "Entrar",
            register: (() => undefined) as never,
            errors: {},
            isSubmitting: true,
            requestError: "Invalid credentials",
            onSubmit: (() => undefined) as never,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Entrando...")).toBeTruthy();
    expect(screen.getByText("Invalid credentials")).toBeTruthy();
  });
});
