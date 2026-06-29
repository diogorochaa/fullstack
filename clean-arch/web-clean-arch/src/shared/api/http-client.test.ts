import { afterEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "./http-client";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("httpClient", () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it("serializa o body e retorna o JSON da resposta", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
      }),
    );

    const response = await httpClient<{ ok: boolean }>("/users", {
      method: "POST",
      body: { name: "Ada" },
    });

    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ada" }),
    });
  });

  it("lança ApiError quando a API responde com erro", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Email already in use" }), {
        status: 409,
      }),
    );

    await expect(httpClient("/users")).rejects.toMatchObject({
      name: "ApiError",
      message: "Email already in use",
      status: 409,
    });
  });
});
