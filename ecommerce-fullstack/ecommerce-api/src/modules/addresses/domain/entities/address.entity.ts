export class Address {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly street: string,
    public readonly number: string,
    public readonly complement: string | null,
    public readonly city: string,
    public readonly state: string,
    public readonly zip: string,
    public readonly isDefault: boolean,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    street: string;
    number: string;
    complement?: string | null;
    city: string;
    state: string;
    zip: string;
    isDefault?: boolean;
  }) {
    return new Address(
      props.id,
      props.userId,
      props.street,
      props.number,
      props.complement ?? null,
      props.city,
      props.state,
      props.zip,
      props.isDefault ?? false,
    );
  }

  update(props: {
    street?: string;
    number?: string;
    complement?: string | null;
    city?: string;
    state?: string;
    zip?: string;
    isDefault?: boolean;
  }) {
    return Address.create({
      id: this.id,
      userId: this.userId,
      street: props.street ?? this.street,
      number: props.number ?? this.number,
      complement:
        props.complement !== undefined ? props.complement : this.complement,
      city: props.city ?? this.city,
      state: props.state ?? this.state,
      zip: props.zip ?? this.zip,
      isDefault: props.isDefault ?? this.isDefault,
    });
  }
}
