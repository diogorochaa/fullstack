import { BadRequestException } from '@nestjs/common';

export class InvalidEmailException extends BadRequestException {
  constructor(email?: string) {
    super(email ? `E-mail inválido: ${email}` : 'E-mail inválido');
  }
}
