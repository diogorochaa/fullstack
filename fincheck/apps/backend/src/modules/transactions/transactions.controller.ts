import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUserId } from '../../shared/decorators/ActiveUserId';
import { OptionalParseUUIDPipe } from '../../shared/pipes/OptionalParseUUIDPipe';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from './entities/Transaction';
import { TransactionsService } from './services/transactions.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiOkResponse({ description: 'Transaction created' })
  create(
    @ActiveUserId() userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters' })
  @ApiQuery({ name: 'month', required: true, type: Number, example: 4 })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2026 })
  @ApiQuery({
    name: 'bankAccountId',
    required: false,
    type: String,
    format: 'uuid',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionType,
  })
  @ApiOkResponse({ description: 'Transaction list' })
  findAll(
    @ActiveUserId() userId: string,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('bankAccountId', OptionalParseUUIDPipe) bankAccountId?: string,
    @Query('type', new ParseEnumPipe(TransactionType, { optional: true }))
    type?: TransactionType,
  ) {
    return this.transactionsService.findAllByUserId(userId, {
      month,
      year,
      bankAccountId,
      type,
    });
  }

  @Put(':transactionId')
  @ApiOperation({ summary: 'Update transaction' })
  @ApiParam({
    name: 'transactionId',
    format: 'uuid',
    description: 'Transaction id',
  })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiOkResponse({ description: 'Transaction updated' })
  update(
    @ActiveUserId() userId: string,
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(
      userId,
      transactionId,
      updateTransactionDto,
    );
  }

  @Delete(':transactionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiParam({
    name: 'transactionId',
    format: 'uuid',
    description: 'Transaction id',
  })
  @ApiNoContentResponse({ description: 'Transaction deleted' })
  remove(
    @ActiveUserId() userId: string,
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.transactionsService.remove(userId, transactionId);
  }
}
