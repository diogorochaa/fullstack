import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class PaymentWebhookDto {
  @IsUUID()
  paymentId: string;

  @IsIn(['PENDING', 'PAID', 'FAILED'])
  status: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}
