import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  zip?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
