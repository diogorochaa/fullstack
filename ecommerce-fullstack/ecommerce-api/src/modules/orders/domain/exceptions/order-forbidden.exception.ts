import { ForbiddenException } from '@nestjs/common';

export class OrderForbiddenException extends ForbiddenException {
  constructor() {
    super('Você não tem acesso a este pedido');
  }
}
