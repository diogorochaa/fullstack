import { ForbiddenException } from '@nestjs/common';

export class AddressForbiddenException extends ForbiddenException {
  constructor() {
    super('Você não tem acesso a este endereço');
  }
}
