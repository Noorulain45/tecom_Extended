import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private config;
    server: Server;
    constructor(config: ConfigService);
    handleConnection(client: Socket): void;
    handleDisconnect(_client: Socket): void;
    handleJoin(client: Socket, userId: string): void;
}
