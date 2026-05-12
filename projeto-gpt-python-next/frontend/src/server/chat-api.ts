const BACKEND_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8001";

type HistoryMessage = {
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type AskAiResponse = {
  response: string;
};

function authHeaders(token?: string, contentType = "application/json") {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

async function readErrorMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const err = (await response.json().catch(() => null)) as {
      detail?: unknown;
    } | null;
    const detail = err?.detail;
    if (typeof detail === "string") return detail;
  }

  const body = await response.text().catch(() => "");
  if (body.trim()) return body;

  return fallback;
}

export async function requestMessages(
  token?: string,
): Promise<HistoryMessage[]> {
  const response = await fetch(`${BACKEND_API_URL}/messages/`, {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Falha ao carregar o historico."),
    );
  }

  return (await response.json()) as HistoryMessage[];
}

export async function clearMessageHistory(token?: string): Promise<void> {
  const response = await fetch(`${BACKEND_API_URL}/messages/`, {
    method: "DELETE",
    headers: authHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Falha ao limpar o historico."),
    );
  }
}

export async function postMessage(
  token?: string,
  conversationId: string,
  role: "user" | "assistant",
  content: string,
): Promise<void> {
  const response = await fetch(`${BACKEND_API_URL}/messages/`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ conversation_id: conversationId, role, content }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Falha ao salvar a mensagem."),
    );
  }
}

export async function requestAiAnswer(
  question: string,
  token?: string,
): Promise<string> {
  const response = await fetch(`${BACKEND_API_URL}/ai`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ question }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Falha ao consultar a API.");
  }

  const data = (await response.json()) as AskAiResponse;
  return data.response;
}

export async function requestDocumentUpload(
  file: File,
  token?: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_API_URL}/upload/`, {
    method: "POST",
    headers: authHeaders(token, ""),
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Falha ao enviar arquivo para a API."),
    );
  }
}
