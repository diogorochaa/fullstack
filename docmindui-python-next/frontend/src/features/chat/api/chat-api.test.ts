import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  clearMessageHistory,
  deleteConversationHistory,
  postMessage,
  requestAiAnswer,
  requestDocumentUpload,
  requestMessages,
} from "./chat-api"

describe("chat-api", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("fetch not mocked"))),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("requestMessages retorna histórico e envia Authorization", async () => {
    const payload = [
      {
        conversation_id: "c1",
        role: "user" as const,
        content: "oi",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const rows = await requestMessages("token-abc")

    expect(rows).toEqual(payload)
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/messages/",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer token-abc" }),
      }),
    )
  })

  it("postMessage envia conversation_id, role e content", async () => {
    const saved = {
      conversation_id: "conv-1",
      role: "user",
      content: "Olá",
      created_at: "2026-01-01T00:00:00Z",
    }
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(saved), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const result = await postMessage("conv-1", "user", "Olá", "tok")

    expect(result).toEqual(saved)
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/messages/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ conversation_id: "conv-1", role: "user", content: "Olá" }),
      }),
    )
  })

  it("requestAiAnswer retorna o campo response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ response: "Resposta da IA" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const text = await requestAiAnswer("Pergunta?", "tok")

    expect(text).toBe("Resposta da IA")
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/ai",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ question: "Pergunta?" }),
      }),
    )
  })

  it("requestDocumentUpload envia FormData com arquivo", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "ok" }), { status: 200 }),
    )

    const file = new File(["%PDF-1.4"], "doc.pdf", { type: "application/pdf" })
    await requestDocumentUpload(file, "tok")

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe("POST")
    expect(init.headers).toEqual(expect.objectContaining({ Authorization: "Bearer tok" }))
    expect(init.body).toBeInstanceOf(FormData)
  })

  it("deleteConversationHistory chama DELETE na conversa", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    await deleteConversationHistory("conv-uuid", "tok")

    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/messages/conversations/conv-uuid",
      expect.objectContaining({ method: "DELETE" }),
    )
  })

  it("clearMessageHistory chama DELETE em /messages/", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    await clearMessageHistory("tok")

    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/messages/",
      expect.objectContaining({ method: "DELETE" }),
    )
  })

  it("requestMessages lança em JSON inválido", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("not-json", { status: 200, headers: { "content-type": "application/json" } }),
    )

    await expect(requestMessages()).rejects.toThrow(/histórico de mensagens/)
  })
})
