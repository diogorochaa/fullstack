import { BadRequestException } from '@nestjs/common';

export class InvalidPaymentException extends BadRequestException {
  constructor(reason: string) {
    super(`Pagamento inválido: ${reason}`);
  }
}
