import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren, ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateUserForm } from "./create-user-form";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(ui, { wrapper: Wrapper });
}

describe("CreateUserForm", () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it("exibe erro de validação sem chamar a API", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateUserForm />);

    await user.type(screen.getByLabelText(/nome/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/e-mail/i), "email-invalido");
    await user.click(screen.getByRole("button", { name: /criar usuário/i }));

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("envia os dados válidos para o endpoint de criação", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: {
            id: "user-1",
            name: "Ada Lovelace",
            email: "ada@example.com",
            createdAt: "2026-06-24T12:00:00.000Z",
            updatedAt: "2026-06-24T12:00:00.000Z",
          },
        }),
        { status: 201 },
      ),
    );

    renderWithQueryClient(<CreateUserForm />);

    await user.type(screen.getByLabelText(/nome/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/e-mail/i), "ada@example.com");
    await user.click(screen.getByRole("button", { name: /criar usuário/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/users",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Ada Lovelace",
          email: "ada@example.com",
        }),
      }),
    );
  });
});
