import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUserId } from '../../shared/decorators/ActiveUserId';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({
    description: 'Current user profile',
    schema: {
      example: {
        name: 'John Doe',
        email: 'john@doe.com',
      },
    },
  })
  me(@ActiveUserId() userId: string) {
    return this.usersService.getUserById(userId);
  }
}
