import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';
import * as Bcrypt from 'bcrypt';

import { BaseService } from '../shared/base.service';
import { User } from './user.model';
import { CreateUserDto } from './user.dto';
import { PaginationDto } from '../shared/general.interface';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(@InjectModel(User.name) userModel: ReturnModelType<typeof User>) {
    super(userModel);
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, displayName } = createUserDto;

    const user = new User();

    user.email = email;
    user.password = await Bcrypt.hash(password, 10);
    user.displayName = displayName;

    let createdUser = await this.create(user);

    return { _id: createdUser._id, createdAt: createdUser.createdAt };
  }

  async getUsers(userId: string, paginationDto: PaginationDto) {
    return this.findWithPagination(
      { _id: { $nin: [this.toObjectId(userId)] } },
      paginationDto,
      {
        email: 1,
        displayName: 1,
      },
    );
  }

  async getUserInfo(id: string) {
    return this.findById(id, {
      conversations: 1,
      newMessageConversations: 1,
      email: 1,
      displayName: 1,
      updatedAt: 1,
    });
  }

  async readConversation(userId: string, conversationId: string) {
    return this.updateById(
      userId,
      {
        $pull: { newMessageConversations: conversationId },
      },
      { projection: {} },
    );
  }
}
