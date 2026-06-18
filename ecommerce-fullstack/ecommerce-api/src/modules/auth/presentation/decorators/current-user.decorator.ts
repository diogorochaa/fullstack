import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthenticatedUser } from 'src/modules/auth/domain/types/authenticated-user';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
