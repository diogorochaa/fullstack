import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersRepository } from '../../shared/database/repositories/users.repositories';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signin(signinDto: SigninDto) {
    const { email, password } = signinDto;

    const user = await this.usersRepository.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user.id);

    return { accessToken };
  }

  async signup(signupDto: SignupDto) {
    const { email, name, password } = signupDto;

    const existingEmail = await this.usersRepository.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await hash(password, 12);

    const user = await this.usersRepository.create({
      data: {
        email,
        name,
        password: passwordHash,
      },
    });

    const accessToken = await this.generateAccessToken(user.id);

    return {
      accessToken,
    };
  }

  private generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId });
  }
}
