import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  path: '/storefront/synchronize',
  cors: {
    origin: '*'
  }
})
export class SynchronizeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(@ConnectedSocket() client: Server): void {
    console.log('Initialized');
  }

  handleConnection(@ConnectedSocket() client: Server): void {
    console.log('Connected');
  }

  handleDisconnect(@ConnectedSocket() client: Server): void {
    console.log('Disconnected');
  }

  @SubscribeMessage('synchronize')
  async handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Server): Promise<void> {
    (await this.server.fetchSockets())
      .forEach(socket => console.log(socket.id));
  }
}
