import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => MessagesModule), 
    forwardRef(() => UsersModule),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
