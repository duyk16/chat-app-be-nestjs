import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Payload } from '../auth/jwt.interface';
import { GetUser } from '../auth/getUser.decorator';
import { PaginationDto, PaginationPipe } from '../shared/general.interface';

@Controller('users')
@UseGuards(AuthGuard())
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/:id')
  async getUserInfo(@Param() id: string) {
    return await this.usersService.getUserInfo(id);
  }

  @Get('/')
  async setUsers(
    @GetUser() payload: Payload,
    @Query(PaginationPipe) paginationDto: PaginationDto,
  ) {
    return await this.usersService.getUsers(payload._id, paginationDto);
  }
}
