import { env } from "@/shared/config/env";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function httpClient<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status, data);
  }

  return data as TResponse;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

function getErrorMessage(data: unknown): string {
  if (isObject(data) && typeof data.message === "string") {
    return data.message;
  }

  return "Não foi possível completar a requisição.";
}

function isObject(value: unknown): value is { message?: unknown } {
  return typeof value === "object" && value !== null;
}
