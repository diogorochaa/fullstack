export class Category {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
  ) {}

  static create(props: { id: string; name: string; slug: string }) {
    return new Category(props.id, props.name, props.slug);
  }

  update(props: { name?: string; slug?: string }) {
    return Category.create({
      id: this.id,
      name: props.name ?? this.name,
      slug: props.slug ?? this.slug,
    });
  }
}
