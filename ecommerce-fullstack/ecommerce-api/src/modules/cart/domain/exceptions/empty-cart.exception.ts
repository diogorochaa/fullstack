import { BadRequestException } from '@nestjs/common';

export class EmptyCartException extends BadRequestException {
  constructor() {
    super('Carrinho vazio');
  }
}
