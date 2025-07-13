import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AlertsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  /** Emite una alerta crítica a todos los clientes. */
  sendAlertToAll(alertPayload: any) {
    this.server.emit('newAlert', alertPayload);
    console.log('🚨 Emitiendo nueva alerta a todos los clientes.');
  }

  /** Emite la actualización de estado de un nodo específico. */
  sendNodeUpdate(nodeData: any) {
    // El frontend escuchará este evento para actualizar el mapa.
    this.server.emit('nodeUpdate', nodeData);
    console.log(`📡 Emitiendo actualización para el nodo: ${nodeData.id}`);
  }
}