import { NotFoundException } from '@nestjs/common';

export class CartNotFoundException extends NotFoundException {
  constructor() {
    super('Carrinho não encontrado');
  }
}

export class CartItemNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Item do carrinho com id ${id} não encontrado`);
  }
}
