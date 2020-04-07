import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from './jwt.interface';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Payload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
