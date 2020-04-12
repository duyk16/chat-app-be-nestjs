import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message } from './message.model';
import { AuthModule } from '../auth/auth.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { UsersModule } from '../users/users.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: Message.schema }]),
    AuthModule,
    forwardRef(() => ConversationsModule),
    forwardRef(() => UsersModule),
    SocketModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
