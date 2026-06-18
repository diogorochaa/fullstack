import { Inject, Injectable } from '@nestjs/common';
import { LoginDto } from 'src/modules/auth/application/dto/login.dto';
import { TOKEN_SERVICE } from 'src/modules/auth/domain/constants/auth.tokens';
import { InvalidCredentialsException } from 'src/modules/auth/domain/exceptions/invalid-credentials.exception';
import { TokenService } from 'src/modules/auth/domain/services/token.service';
import { USER_REPOSITORY } from 'src/modules/users/domain/constants/user.tokens';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { UserRepository } from 'src/modules/users/domain/repositories/user.repository';
import { EmailValueObject } from 'src/modules/users/domain/value-objects/email.vo';
import { PasswordValueObject } from 'src/modules/users/domain/value-objects/password.vo';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    input: LoginDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const email = EmailValueObject.create(input.email);

    const user = await this.userRepository.findByEmail(email.getValue());

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isValid = await PasswordValueObject.compare(
      input.password,
      user.password.getValue(),
    );

    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email.getValue(),
      role: user.role,
    };

    const accessToken = await this.tokenService.sign(tokenPayload);
    const refreshToken = await this.tokenService.signRefresh(tokenPayload);

    return { user, accessToken, refreshToken };
  }
}
