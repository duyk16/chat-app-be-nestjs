import { Controller, Get, UseGuards, Req } from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Payload } from '../auth/jwt.interface';
import { GetUser } from '../auth/getUser.decorator';

@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  async getUserInfo(@GetUser() payload: Payload) {
    return await this.usersService.getUserInfo(payload.email);
  }
}
