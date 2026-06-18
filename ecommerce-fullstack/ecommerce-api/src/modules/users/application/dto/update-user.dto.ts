import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AtLeastOneField } from '../validators/at-least-one-field.validator';

@AtLeastOneField()
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
