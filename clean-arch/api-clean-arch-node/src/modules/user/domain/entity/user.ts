import type { Email } from "../value-objects/email";

export type UserProps = {
  id: string;
  name: string;
  email: Email;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email.value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get emailAddress(): Email {
    return this.props.email;
  }
}
