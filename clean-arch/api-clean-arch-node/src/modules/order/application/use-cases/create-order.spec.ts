import { describe, expect, it } from "vitest";
import { ProductNotFoundError } from "../../../product/application/errors/product-not-found-error";
import { Product } from "../../../product/domain/entity/product";
import type { ProductsRepository } from "../../../product/domain/repository/products-repository";
import { UserNotFoundError } from "../../../user/application/errors/user-not-found-error";
import { User } from "../../../user/domain/entity/user";
import type {
  CreateUserRepositoryInput,
  UsersRepository,
} from "../../../user/domain/repository/users-repository";
import { Email } from "../../../user/domain/value-objects/email";
import type { Order } from "../../domain/entity/order";
import { InvalidOrderQuantityError } from "../../domain/errors/invalid-order-quantity-error";
import type { OrdersRepository } from "../../domain/repository/orders-repository";
import { CreateOrderUseCase } from "./create-order";

const userId = "88a6607f-1cad-47ce-8d48-c3fd3b5776a7";
const productId = "a3095117-2d5f-418f-97d1-1479e0ea4d20";

class InMemoryOrdersRepository implements OrdersRepository {
  orders: Order[] = [];

  async create(order: Order): Promise<Order> {
    this.orders.push(order);
    return order;
  }
}

class InMemoryUsersRepository implements UsersRepository {
  users: User[] = [];

  async create(data: CreateUserRepositoryInput): Promise<User> {
    const user = User.create({
      id: userId,
      name: data.name,
      email: data.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.push(user);
    return user;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((user) => user.email === email.value) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async list(): Promise<User[]> {
    return this.users;
  }
}

class InMemoryProductsRepository implements ProductsRepository {
  products: Product[] = [];

  async create(product: Product): Promise<Product> {
    this.products.push(product);
    return product;
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }
}

function makeSut() {
  const ordersRepository = new InMemoryOrdersRepository();
  const usersRepository = new InMemoryUsersRepository();
  const productsRepository = new InMemoryProductsRepository();
  const sut = new CreateOrderUseCase(ordersRepository, usersRepository, productsRepository);

  return {
    ordersRepository,
    usersRepository,
    productsRepository,
    sut,
  };
}

describe("CreateOrderUseCase", () => {
  it("should create an order for an existing user", async () => {
    const { ordersRepository, productsRepository, usersRepository, sut } = makeSut();
    await usersRepository.create({
      name: "John Doe",
      email: Email.create("john.doe@example.com"),
    });
    await productsRepository.create(
      Product.create({
        id: productId,
        name: "Clean Architecture Book",
        price: 10.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const order = await sut.execute({
      userId,
      productId,
      quantity: 2,
    });

    expect(order).toEqual(
      expect.objectContaining({
        userId,
        productId,
        quantity: 2,
        price: 10.5,
        total: 21,
      }),
    );
    expect(order.id).toEqual(expect.any(String));
    expect(order.createdAt).toBeInstanceOf(Date);
    expect(ordersRepository.orders).toHaveLength(1);
  });

  it("should not create an order for a missing user", async () => {
    const { ordersRepository, sut } = makeSut();

    await expect(
      sut.execute({
        userId,
        productId,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
    expect(ordersRepository.orders).toHaveLength(0);
  });

  it("should not create an order for a missing product", async () => {
    const { ordersRepository, usersRepository, sut } = makeSut();
    await usersRepository.create({
      name: "John Doe",
      email: Email.create("john.doe@example.com"),
    });

    await expect(
      sut.execute({
        userId,
        productId,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
    expect(ordersRepository.orders).toHaveLength(0);
  });

  it("should not create an order with invalid quantity", async () => {
    const { ordersRepository, productsRepository, usersRepository, sut } = makeSut();
    await usersRepository.create({
      name: "John Doe",
      email: Email.create("john.doe@example.com"),
    });
    await productsRepository.create(
      Product.create({
        id: productId,
        name: "Clean Architecture Book",
        price: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await expect(
      sut.execute({
        userId,
        productId,
        quantity: 0,
      }),
    ).rejects.toBeInstanceOf(InvalidOrderQuantityError);
    expect(ordersRepository.orders).toHaveLength(0);
  });
});
