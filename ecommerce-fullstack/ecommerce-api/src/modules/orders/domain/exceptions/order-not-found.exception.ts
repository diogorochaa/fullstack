import { NotFoundException } from '@nestjs/common';

export class OrderNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Pedido com id ${id} não encontrado`);
  }
}
