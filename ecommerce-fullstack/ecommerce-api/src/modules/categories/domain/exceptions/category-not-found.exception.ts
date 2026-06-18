import { NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Categoria com id ${id} não encontrada`);
  }
}
