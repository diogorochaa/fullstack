import { EmailValueObject } from 'src/modules/users/domain/value-objects/email.vo';
import { PasswordValueObject } from 'src/modules/users/domain/value-objects/password.vo';

export class User {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: EmailValueObject,
    public readonly password: PasswordValueObject,
    public readonly role: string,
  ) {}

  static create(props: {
    id: string;
    name: string;
    email: EmailValueObject;
    password: PasswordValueObject;
    role?: string;
  }) {
    return new User(
      props.id,
      props.name,
      props.email,
      props.password,
      props.role ?? 'CUSTOMER',
    );
  }

  update(props: {
    name?: string;
    email?: EmailValueObject;
    password?: PasswordValueObject;
    role?: string;
  }) {
    return User.create({
      id: this.id,
      name: props.name ?? this.name,
      email: props.email ?? this.email,
      password: props.password ?? this.password,
      role: props.role ?? this.role,
    });
  }
}
