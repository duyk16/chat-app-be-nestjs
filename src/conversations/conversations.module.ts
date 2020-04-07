import { Module } from '@nestjs/common';

import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { UsersModule } from '../users/users.module';
import { Conversation } from './conversation.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: Conversation.schema },
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
