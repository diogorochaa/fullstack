import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

const FIELD_LABELS: Record<string, string> = {
  email: 'E-mail',
  password: 'Senha',
  name: 'Nome',
  addressId: 'Endereço',
  orderId: 'Pedido',
  categoryId: 'Categoria',
  price: 'Preço',
  stock: 'Estoque',
  description: 'Descrição',
  status: 'Status',
};

const MESSAGE_MAP: Record<string, string> = {
  'email must be an email': 'E-mail inválido',
  'password must be longer than or equal to 6 characters':
    'Senha deve ter no mínimo 6 caracteres',
  'name must be longer than or equal to 3 characters':
    'Nome deve ter no mínimo 3 caracteres',
  'name must be a string': 'Nome inválido',
  'password must be a string': 'Senha inválida',
  'email must be a string': 'E-mail inválido',
};

function translateConstraint(
  property: string,
  constraint: string,
): string | null {
  const label = FIELD_LABELS[property] ?? property;
  const exact = MESSAGE_MAP[constraint];
  if (exact) return exact;

  if (constraint.includes('must be longer than or equal to')) {
    const min = constraint.match(/\d+/)?.[0];
    return min
      ? `${label} deve ter no mínimo ${min} caracteres`
      : `${label} muito curto`;
  }

  if (constraint.includes('must be an email')) {
    return 'E-mail inválido';
  }

  if (constraint.includes('must be a UUID')) {
    return `${label} inválido`;
  }

  if (constraint.includes('should not exist')) {
    return `Campo "${property}" não é permitido`;
  }

  if (constraint.includes('must not be empty')) {
    return `${label} é obrigatório`;
  }

  return null;
}

function flattenErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      for (const constraint of Object.values(error.constraints)) {
        const translated =
          translateConstraint(error.property, constraint) ?? constraint;
        messages.push(translated);
      }
    }

    if (error.children?.length) {
      messages.push(...flattenErrors(error.children));
    }
  }

  return messages;
}

export function validationExceptionFactory(errors: ValidationError[]) {
  const messages = flattenErrors(errors);
  return new BadRequestException(
    messages.length ? messages : 'Dados inválidos',
  );
}
