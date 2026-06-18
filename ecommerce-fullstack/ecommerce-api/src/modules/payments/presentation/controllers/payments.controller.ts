import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from 'src/modules/auth/domain/types/authenticated-user';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/presentation/decorators/current-user.decorator';
import { CreatePaymentDto } from 'src/modules/payments/application/dto/create-payment.dto';
import { PaymentWebhookDto } from 'src/modules/payments/application/dto/payment-webhook.dto';
import {
  CreatePaymentUseCase,
  PaymentWebhookUseCase,
} from 'src/modules/payments/application/use-cases/payment/payment.usecase';
import { PaymentResponse } from 'src/modules/payments/presentation/responses/payment.response';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createPayment: CreatePaymentUseCase,
    private readonly paymentWebhook: PaymentWebhookUseCase,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Criar pagamento simulado para um pedido PENDING' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePaymentDto,
  ): Promise<PaymentResponse> {
    const payment = await this.createPayment.execute(user.userId, body);
    return PaymentResponse.fromEntity(payment);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook de confirmação de pagamento (idempotente)',
  })
  async webhook(
    @Headers('x-webhook-secret') secret: string | undefined,
    @Body() body: PaymentWebhookDto,
  ): Promise<PaymentResponse> {
    const expectedSecret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET');

    if (expectedSecret && secret !== expectedSecret) {
      throw new UnauthorizedException('Webhook não autorizado');
    }

    const payment = await this.paymentWebhook.execute(body);
    return PaymentResponse.fromEntity(payment);
  }
}
