import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import {
  Logger,
  ValidationPipe,
  WsMessageHandler,
  UseGuards,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import * as Jwt from 'jsonwebtoken';

import { SocketGuard } from './socket.guard';
import { Payload } from '../auth/jwt.interface';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/message.dto';
import { Message } from '../messages/message.model';
import { UsersService } from '../users/users.service';
import { Conversation } from '../conversations/conversation.model';

@WebSocketGateway(3001)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  static users: { [key in string]: string } = {};

  static clients: { [key in string]: string } = {};

  private logger: Logger = new Logger('SocketGateway');

  constructor(
    @Inject(forwardRef(() => MessagesService))
    private messagesService: MessagesService,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  handleConnection(socket: Socket) {
    this.logger.log(`Connected ${socket.id}`);
    SocketGateway.clients[socket.id] = '';

    setTimeout(() => {
      const isAuth = SocketGateway.clients[socket.id];
      if (!isAuth) {
        socket.disconnect();
      }
    }, 5000);
  }

  handleDisconnect(socket: Socket) {
    const user = SocketGateway.clients[socket.id];
    if (user) {
      delete SocketGateway.users[user];
      this.logger.log(`User ${user} disconnected`);
    }

    this.logger.log(`Client ${socket.id} disconnected.`);
  }

  @SubscribeMessage('AUTH')
  handleAuth(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ): string {
    if (typeof data !== 'string') {
      throw new WsException('Missing token');
    }

    let payload: Payload;

    try {
      payload = Jwt.verify(data, process.env.JWT_SECRET) as Payload;
    } catch (error) {
      this.logger.log(
        `AUTH FAIL - Client ${socket.id}. Data: ${JSON.stringify(data)}`,
      );
      throw new WsException('Token is not valid');
    }

    SocketGateway.clients[socket.id] = payload._id;
    SocketGateway.users[payload._id] = socket.id;

    this.logger.log(
      `AUTH SUCCESS - Client ${socket.id}. Data: ${JSON.stringify(data)}`,
    );

    return 'success';
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('MESSAGE')
  async createMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody(ValidationPipe) createMessageDto: CreateMessageDto,
  ): Promise<string> {
    const userId = SocketGateway.clients[socket.id];

    this.logger.log(
      `MESSAGE - User ${userId}. Data: ${JSON.stringify(createMessageDto)}`,
    );

    await this.messagesService.createMessage(userId, createMessageDto);

    return 'ok';
  }

  @UseGuards(SocketGuard)
  @SubscribeMessage('CONVERSATION-READ')
  async readMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() id: string,
  ): Promise<string> {
    const userId = SocketGateway.clients[socket.id];

    if (typeof id !== 'string') {
      throw new WsException(`Conversation Id is not valid`);
    }

    await this.usersService.readConversation(userId, id);

    this.logger.log(
      `CONVERSATION-READ - User ${userId}. Data: ${JSON.stringify(id)}`,
    );
    return 'ok';
  }

  async sendMessage(userId: string, message: Message) {
    this.server.to(SocketGateway.users[userId]).emit('MESSAGE', message);
  }

  async sendConversation(userId: string, data: Conversation) {
    this.server.to(SocketGateway.users[userId]).emit('CONVERSATION', data);
  }
}
