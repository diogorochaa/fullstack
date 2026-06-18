import { NotFoundException } from '@nestjs/common';

export class PaymentNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Pagamento com id ${id} não encontrado`);
  }
}
