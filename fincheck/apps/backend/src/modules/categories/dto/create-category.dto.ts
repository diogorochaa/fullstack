import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../../transactions/entities/Transaction';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Alimentacao',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({
    example: 'tag',
  })
  @IsString()
  @IsOptional()
  icon?: string;
}
