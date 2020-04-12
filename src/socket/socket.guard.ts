import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ws = context.switchToWs();
    const client = ws.getClient() as Socket;
    const id = client.id;

    const isAuth = SocketGateway.clients[id];

    if (!isAuth) throw new WsException(`Unauthentication`);

    return true;
  }
}
