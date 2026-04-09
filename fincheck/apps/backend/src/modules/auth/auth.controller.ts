import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IsPublic } from '../../shared/decorators/IsPublic';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

@IsPublic()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiOperation({ summary: 'Sign in and receive an access token' })
  @ApiBody({ type: SigninDto })
  @ApiOkResponse({
    description: 'Authenticated successfully',
    schema: {
      example: {
        accessToken: 'jwt-token',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a user and receive an access token' })
  @ApiBody({ type: SignupDto })
  @ApiOkResponse({
    description: 'User created successfully',
    schema: {
      example: {
        accessToken: 'jwt-token',
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already exists' })
  create(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
}
