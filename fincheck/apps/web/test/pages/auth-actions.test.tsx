import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "../../src/pages/login";
import { RegisterPage } from "../../src/pages/register";
import * as api from "../../src/services/api";

const navigateMock = vi.fn();

vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../src/services/api", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/api")>(
    "../../src/services/api",
  );

  return {
    ...actual,
    signin: vi.fn(),
    signup: vi.fn(),
  };
});

function createWrapper(config?: QueryClientConfig) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
    ...config,
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe("auth page actions integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits login form and navigates on success", async () => {
    vi.mocked(api.signin).mockResolvedValue({ accessToken: "login-token" });

    const Wrapper = createWrapper();
    const { getByLabelText, getByRole } = render(<LoginPage />, {
      wrapper: Wrapper,
    });

    fireEvent.change(getByLabelText("Email"), {
      target: { value: "john@doe.com" },
    });
    fireEvent.change(getByLabelText("Senha"), {
      target: { value: "12345678" },
    });

    fireEvent.submit(getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(api.signin).toHaveBeenCalledTimes(1);
      expect(vi.mocked(api.signin).mock.calls[0]?.[0]).toEqual({
        email: "john@doe.com",
        password: "12345678",
      });
    });

    await waitFor(() => {
      expect(window.localStorage.getItem("accessToken")).toBe("login-token");
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("shows login API error when signin fails", async () => {
    vi.mocked(api.signin).mockRejectedValue(new Error("Invalid credentials"));

    const Wrapper = createWrapper();
    const { getByLabelText, getByRole, findByText } = render(<LoginPage />, {
      wrapper: Wrapper,
    });

    fireEvent.change(getByLabelText("Email"), {
      target: { value: "john@doe.com" },
    });
    fireEvent.change(getByLabelText("Senha"), {
      target: { value: "12345678" },
    });

    fireEvent.submit(getByRole("button", { name: "Entrar" }));

    expect(await findByText("Invalid credentials")).toBeTruthy();
  });

  it("shows signup API error on register form", async () => {
    vi.mocked(api.signup).mockRejectedValue(new Error("Email already exists"));

    const Wrapper = createWrapper();
    const { getByLabelText, getByRole, findByText } = render(<RegisterPage />, {
      wrapper: Wrapper,
    });

    fireEvent.change(getByLabelText("Nome"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByLabelText("Email"), {
      target: { value: "john@doe.com" },
    });
    fireEvent.change(getByLabelText("Senha"), {
      target: { value: "12345678" },
    });

    fireEvent.submit(getByRole("button", { name: "Cadastrar" }));

    expect(await findByText("Email already exists")).toBeTruthy();
  });

  it("submits register form and navigates on success", async () => {
    vi.mocked(api.signup).mockResolvedValue({ accessToken: "register-token" });

    const Wrapper = createWrapper();
    const { getByLabelText, getByRole } = render(<RegisterPage />, {
      wrapper: Wrapper,
    });

    fireEvent.change(getByLabelText("Nome"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByLabelText("Email"), {
      target: { value: "john@doe.com" },
    });
    fireEvent.change(getByLabelText("Senha"), {
      target: { value: "12345678" },
    });

    fireEvent.submit(getByRole("button", { name: "Cadastrar" }));

    await waitFor(() => {
      expect(window.localStorage.getItem("accessToken")).toBe("register-token");
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });
});
