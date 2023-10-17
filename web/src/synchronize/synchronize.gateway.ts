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
import {Injectable} from "@nestjs/common";
import {Server, Socket} from 'socket.io';

type SyncProps = {
  customer: string;
  items: any[];
}

@WebSocketGateway({
  path: '/storefront/synchronize',
  cors: {
    origin: '*'
  }
})
@Injectable()
export class SynchronizeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  afterInit(@ConnectedSocket() client: Socket): void {
    console.log('Initialized');
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    console.log('Connected', client.id, client.rooms);
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    // console.log('Disconnected');
  }

  @SubscribeMessage('session')
  async handleSession(@MessageBody() customer: string, @ConnectedSocket() client: Socket): Promise<void> {
    console.log(customer);

    if (customer) {
      client.join(customer);
    }

    this.server.in(customer).emit('synchronize', customer);
  }

  @SubscribeMessage('synchronize')
  async handleMessage(@MessageBody() { customer, items }: SyncProps, @ConnectedSocket() client: Socket): Promise<void> {
    console.log('here', customer);
    this.server.to(customer).emit('synchronize', customer, items);
  }
}
