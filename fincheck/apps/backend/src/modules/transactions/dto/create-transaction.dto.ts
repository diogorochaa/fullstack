import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { TransactionType } from '../entities/Transaction';

export class CreateTransactionDto {
  @ApiProperty({
    format: 'uuid',
    example: '17d9d0e9-b198-43f9-b32f-13f57f4f6fd7',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  bankAccountId!: string;

  @ApiProperty({
    format: 'uuid',
    example: '0b577dfe-41d7-4ce3-b17d-729d6ebfd18a',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    example: 'Salario',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 2500,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  value!: number;

  @ApiProperty({
    format: 'date-time',
    example: '2026-04-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.INCOME,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type!: TransactionType;
}
