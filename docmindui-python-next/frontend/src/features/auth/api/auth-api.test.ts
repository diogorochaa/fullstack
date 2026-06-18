import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { requestLogin, requestRegister } from "./auth-api"

describe("auth-api", () => {
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

  it("requestLogin envia e-mail em minúsculas e retorna o JSON em sucesso", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: "tok", token_type: "bearer" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const result = await requestLogin("User@Example.com", "secret")

    expect(result).toEqual({ access_token: "tok", token_type: "bearer" })
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "secret" }),
      }),
    )
  })

  it("requestLogin propaga detail da API em 401", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "E-mail ou senha inválidos." }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    )

    await expect(requestLogin("a@b.com", "wrong")).rejects.toThrow("E-mail ou senha inválidos.")
  })

  it("requestLogin mapeia falha de rede (ECONNREFUSED)", async () => {
    const err = new TypeError("fetch failed")
    Object.assign(err, { cause: { code: "ECONNREFUSED" } })
    vi.mocked(fetch).mockRejectedValueOnce(err)

    await expect(requestLogin("a@b.com", "x")).rejects.toThrow(/conexão recusada/)
  })

  it("requestRegister retorna dados do usuário em 201", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "uuid-1", email: "u@test.com" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    )

    const result = await requestRegister("U@Test.com", "senha1234")

    expect(result).toEqual({ id: "uuid-1", email: "u@test.com" })
    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "u@test.com", password: "senha1234" }),
      }),
    )
  })
})
