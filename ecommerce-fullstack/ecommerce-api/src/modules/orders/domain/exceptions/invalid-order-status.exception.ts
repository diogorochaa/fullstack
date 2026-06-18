import { BadRequestException } from '@nestjs/common';

export class InvalidOrderStatusException extends BadRequestException {
  constructor(fromStatus: string, toStatus: string) {
    super(`Transição de status inválida: ${fromStatus} → ${toStatus}`);
  }
}
