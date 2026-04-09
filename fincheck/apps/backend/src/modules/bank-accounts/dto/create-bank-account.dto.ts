import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { BankAccountType } from '../entities/BankAccount';

export class CreateBankAccountDto {
  @ApiProperty({
    example: 'Nubank',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 1200,
  })
  @IsNumber()
  @IsNotEmpty()
  initialBalance!: number;

  @ApiProperty({
    enum: BankAccountType,
    example: BankAccountType.CHECKING,
  })
  @IsNotEmpty()
  @IsEnum(BankAccountType)
  type!: BankAccountType;

  @ApiProperty({
    example: '#7950f2',
  })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color!: string;
}
