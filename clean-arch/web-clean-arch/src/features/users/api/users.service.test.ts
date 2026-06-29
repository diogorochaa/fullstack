import { afterEach, describe, expect, it, vi } from "vitest";
import { createUser, getUserById, listUsers } from "./users.service";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

const apiUser = {
  id: "user-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  createdAt: "2026-06-24T12:00:00.000Z",
  updatedAt: "2026-06-24T12:00:00.000Z",
};

describe("users.service", () => {
  afterEach(() => {
    fetchMock.mockReset();
  });

  it("lista usuários e normaliza datas", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ users: [apiUser] }), {
        status: 200,
      }),
    );

    const users = await listUsers();

    expect(users).toHaveLength(1);
    expect(users[0]?.createdAt).toBeInstanceOf(Date);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/users",
      expect.objectContaining({ body: undefined }),
    );
  });

  it("busca um usuário por id", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ user: apiUser }), {
        status: 200,
      }),
    );

    const user = await getUserById("user-1");

    expect(user.name).toBe("Ada Lovelace");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/users/user-1",
      expect.any(Object),
    );
  });

  it("cria um usuário validado pelo schema", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ user: apiUser }), {
        status: 201,
      }),
    );

    const user = await createUser({
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    expect(user.email).toBe("ada@example.com");
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
