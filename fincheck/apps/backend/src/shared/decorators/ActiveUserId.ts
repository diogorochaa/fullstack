import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
  userId?: string;
};

export const ActiveUserId = createParamDecorator<undefined>(
  (_data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.userId;

    if (!userId) {
      throw new UnauthorizedException('User ID not found in request');
    }

    return userId;
  },
);
