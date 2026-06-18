import { BadRequestException } from '@nestjs/common';

export class InsufficientStockException extends BadRequestException {
  constructor(productName: string, available: number) {
    super(`Estoque insuficiente para ${productName}. Disponível: ${available}`);
  }
}
