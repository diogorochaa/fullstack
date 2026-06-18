import { ConflictException } from '@nestjs/common';

export class CategoryAlreadyExistsException extends ConflictException {
  constructor(slug: string) {
    super(`Categoria com slug ${slug} já existe`);
  }
}
