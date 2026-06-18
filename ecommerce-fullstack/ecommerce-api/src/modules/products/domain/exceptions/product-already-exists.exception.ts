import { ConflictException } from '@nestjs/common';

export class ProductAlreadyExistsException extends ConflictException {
  constructor(slug: string) {
    super(`Produto com slug ${slug} já existe`);
  }
}
