import { describe, expect, it } from "vitest";
import { EmailAlreadyInUseError } from "../../../../../src/modules/user/application/errors/email-already-in-use-error";
import { CreateUserUseCase } from "../../../../../src/modules/user/application/use-cases/create-user";
import { InvalidEmailError } from "../../../../../src/modules/user/domain/errors/invalid-email-error";
import { InMemoryUsersRepository } from "../../infra/in-memory-users-repository";

describe("CreateUserUseCase", () => {
  it("creates a user", async () => {
    const usersRepository = new InMemoryUsersRepository();
    const sut = new CreateUserUseCase(usersRepository);

    const user = await sut.execute({
      name: " John Doe ",
      email: "JOHN@example.com",
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@example.com");
  });

  it("does not create two users with the same email", async () => {
    const usersRepository = new InMemoryUsersRepository();
    const sut = new CreateUserUseCase(usersRepository);

    await sut.execute({
      name: "John Doe",
      email: "john@example.com",
    });

    await expect(
      sut.execute({
        name: "Jane Doe",
        email: "JOHN@example.com",
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });

  it("does not create a user with an invalid email", async () => {
    const usersRepository = new InMemoryUsersRepository();
    const sut = new CreateUserUseCase(usersRepository);

    await expect(
      sut.execute({
        name: "John Doe",
        email: "invalid-email",
      }),
    ).rejects.toBeInstanceOf(InvalidEmailError);
  });
});
