import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReturnModelType } from '@typegoose/typegoose';

import { BaseService } from '../shared/base.service';
import { User } from './user.model';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(@InjectModel(User.name) userModel: ReturnModelType<typeof User>) {
    super(userModel);
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, displayName } = createUserDto;

    const user = new User();

    user.email = email;
    user.password = password;
    user.displayName = displayName;

    let createdUser = await this.create(user);

    return { _id: createdUser._id, createdAt: createdUser.createdAt };
  }
}
