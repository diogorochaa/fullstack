import { Type, plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  NotEquals,
  validateSync,
} from 'class-validator';

class Env {
  @IsString()
  @IsNotEmpty()
  @NotEquals('unsecure_jwt_secret')
  jwtSecret!: string;

  @IsString()
  @IsNotEmpty()
  dbURL!: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  port!: number;
}

export const env: Env = plainToInstance(Env, {
  jwtSecret: process.env.JWT_SECRET,
  dbURL: process.env.DATABASE_URL,
  port: process.env.PORT,
});

const errors = validateSync(env);

if (errors.length > 0) {
  throw new Error(JSON.stringify(errors, null, 2));
}
