import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { RegisterPageView } from "../../src/pages/register/view";

describe("register page view", () => {
  it("renders the submitting state and api error", () => {
    render(
      <MemoryRouter>
        <RegisterPageView
          ui={{
            title: "Crie sua conta",
            subtitle: "Comece a organizar sua vida financeira",
            submitLabel: "Cadastrar",
            register: (() => undefined) as never,
            errors: {},
            isSubmitting: true,
            requestError: "Email already exists",
            onSubmit: (() => undefined) as never,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Cadastrando...")).toBeTruthy();
    expect(screen.getByText("Email already exists")).toBeTruthy();
  });
});
