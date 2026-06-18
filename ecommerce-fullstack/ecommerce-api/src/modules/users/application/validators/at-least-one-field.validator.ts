import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function AtLeastOneField(validationOptions?: ValidationOptions) {
  return (constructor: new (...args: unknown[]) => object) => {
    registerDecorator({
      name: 'atLeastOneField',
      target: constructor,
      propertyName: 'atLeastOneField',
      options: validationOptions,
      validator: {
        validate(_: unknown, args: ValidationArguments) {
          const object = args.object as Record<string, unknown>;

          return ['name', 'email', 'password'].some(
            (field) => object[field] !== undefined,
          );
        },
        defaultMessage() {
          return 'Informe pelo menos um campo para atualizar';
        },
      },
    });
  };
}
