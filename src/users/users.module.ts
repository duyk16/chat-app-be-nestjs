import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './user.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: User.schema }]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
