import { clearAccessToken, getAccessToken } from "./auth-storage";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  withAuth?: boolean;
};

type ApiErrorPayload = {
  message?: string | string[];
};

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Nao foi possivel concluir a operacao.";
}

export async function httpClient<TResponse>(
  path: string,
  options: RequestOptions = {},
) {
  const { method = "GET", body, params, withAuth = true } = options;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (withAuth) {
    const token = getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as ApiErrorPayload | null;
    const rawMessage = payload?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : (rawMessage ?? "Nao foi possivel concluir a operacao.");

    if (response.status === 401 && withAuth) {
      clearAccessToken();
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  return (await response.json()) as TResponse;
}
