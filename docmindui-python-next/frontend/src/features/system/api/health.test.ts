import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/config/env", () => ({
  API_BASE_URL: "http://health.test",
}))

import { checkApiHealth } from "./health"

describe("checkApiHealth", () => {
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

  it("retorna true quando /health responde 200", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 200 }))

    await expect(checkApiHealth(3000)).resolves.toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      "http://health.test/health",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    )
  })

  it("retorna false quando a resposta não é ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 503 }))

    await expect(checkApiHealth(3000)).resolves.toBe(false)
  })

  it("retorna false quando fetch falha", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network"))

    await expect(checkApiHealth(3000)).resolves.toBe(false)
  })

  it("retorna false após timeout (abort)", async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockImplementation(
      (_url, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"))
          })
        }),
    )

    const promise = checkApiHealth(1000)
    await vi.advanceTimersByTimeAsync(1000)
    await expect(promise).resolves.toBe(false)
    vi.useRealTimers()
  })
})
