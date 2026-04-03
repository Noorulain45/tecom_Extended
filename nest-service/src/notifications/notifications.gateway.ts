import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private config: ConfigService) {}

  handleConnection(client: Socket) {
    // Authenticate via token in handshake
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const secret = this.config.get<string>('JWT_SECRET') as string;
        const decoded = jwt.verify(token, secret) as unknown as { id: string };
        // Join a personal room so we can send direct notifications
        client.join(`user:${decoded.id}`);
        client.data.userId = decoded.id;
      } catch {
        // unauthenticated — still connected for broadcasts
      }
    }
  }

  handleDisconnect(_client: Socket) {}

  // Client can re-join their room after reconnect
  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    if (client.data.userId === userId) {
      client.join(`user:${userId}`);
    }
  }
}
