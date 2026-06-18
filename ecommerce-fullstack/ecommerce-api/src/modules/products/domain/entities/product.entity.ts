export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly imageUrl: string | null,
    public readonly active: boolean,
    public readonly categoryId: string,
  ) {}

  static create(props: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string | null;
    active?: boolean;
    categoryId: string;
  }) {
    return new Product(
      props.id,
      props.name,
      props.slug,
      props.description,
      props.price,
      props.stock,
      props.imageUrl ?? null,
      props.active ?? true,
      props.categoryId,
    );
  }

  update(props: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    stock?: number;
    imageUrl?: string | null;
    active?: boolean;
    categoryId?: string;
  }) {
    return Product.create({
      id: this.id,
      name: props.name ?? this.name,
      slug: props.slug ?? this.slug,
      description: props.description ?? this.description,
      price: props.price ?? this.price,
      stock: props.stock ?? this.stock,
      imageUrl: props.imageUrl !== undefined ? props.imageUrl : this.imageUrl,
      active: props.active ?? this.active,
      categoryId: props.categoryId ?? this.categoryId,
    });
  }

  deactivate() {
    return this.update({ active: false });
  }

  decrementStock(quantity: number) {
    return this.update({ stock: this.stock - quantity });
  }
}
