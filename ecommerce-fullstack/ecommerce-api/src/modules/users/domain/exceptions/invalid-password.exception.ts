import { BadRequestException } from '@nestjs/common';

export class InvalidPasswordException extends BadRequestException {
  constructor() {
    super('Senha deve ter no mínimo 6 caracteres');
  }
}
