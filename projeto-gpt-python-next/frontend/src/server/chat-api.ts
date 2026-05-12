import "server-only";

const BACKEND_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8001";

type AskAiResponse = {
  response: string;
};

export async function requestAiAnswer(question: string): Promise<string> {
  const response = await fetch(`${BACKEND_API_URL}/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Falha ao consultar a API.");
  }

  const data = (await response.json()) as AskAiResponse;
  return data.response;
}

export async function requestDocumentUpload(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_API_URL}/upload/`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Falha ao enviar arquivo para a API.");
  }
}
