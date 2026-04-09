import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUserId } from '../../shared/decorators/ActiveUserId';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountsService } from './services/bank-accounts.service';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a bank account' })
  @ApiBody({ type: CreateBankAccountDto })
  @ApiOkResponse({
    description: 'Bank account created',
  })
  create(
    @ActiveUserId() userId: string,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(userId, createBankAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'List bank accounts from current user' })
  @ApiOkResponse({ description: 'Bank account list with current balance' })
  findAll(@ActiveUserId() userId: string) {
    return this.bankAccountsService.findAllByUserId(userId);
  }

  @Put(':bankAccountId')
  @ApiOperation({ summary: 'Update bank account' })
  @ApiParam({
    name: 'bankAccountId',
    format: 'uuid',
    description: 'Bank account id',
  })
  @ApiBody({ type: UpdateBankAccountDto })
  @ApiOkResponse({ description: 'Bank account updated' })
  update(
    @ActiveUserId() userId: string,
    @Param('bankAccountId', ParseUUIDPipe) bankAccountId: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(
      userId,
      bankAccountId,
      updateBankAccountDto,
    );
  }

  @Delete(':bankAccountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete bank account' })
  @ApiParam({
    name: 'bankAccountId',
    format: 'uuid',
    description: 'Bank account id',
  })
  @ApiNoContentResponse({ description: 'Bank account deleted' })
  remove(
    @ActiveUserId() userId: string,
    @Param('bankAccountId', ParseUUIDPipe) bankAccountId: string,
  ) {
    return this.bankAccountsService.remove(userId, bankAccountId);
  }
}
