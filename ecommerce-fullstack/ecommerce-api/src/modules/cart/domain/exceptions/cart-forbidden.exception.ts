import { ForbiddenException } from '@nestjs/common';

export class CartForbiddenException extends ForbiddenException {
  constructor() {
    super('Você não tem acesso a este item do carrinho');
  }
}
