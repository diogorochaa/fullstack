import { NotFoundException } from '@nestjs/common';

export class AddressNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Endereço com id ${id} não encontrado`);
  }
}
