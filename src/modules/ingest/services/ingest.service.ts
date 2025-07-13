import { Injectable, NotFoundException } from '@nestjs/common';
import { IngestDataDto } from '../dto/ingest-data.dto';
import { NodesRepository } from 'src/modules/nodes/repositories/nodes.repository';
import { AlertsService } from 'src/modules/alerts/services/alerts.service';
import { AlertsGateway } from 'src/modules/alerts/gateways/alerts.gateway';
import { NodesService } from 'src/modules/nodes/services/nodes.service';

@Injectable()
export class IngestService {
  constructor(
    private readonly nodesRepository: NodesRepository,
    private readonly alertsService: AlertsService,
    private readonly eventsGateway: AlertsGateway,
  ) {}

  async processData(data: IngestDataDto): Promise<void> {
    // 1. Buscamos el nodo completo en la BD para obtener sus datos (incluyendo coordenadas)
    const node = await this.nodesRepository.findById(data.nodeId);
    if (!node) {
      console.error(`Error: Nodo con ID "${data.nodeId}" no encontrado al intentar ingestar datos.`);
      throw new NotFoundException(`Nodo con ID "${data.nodeId}" no encontrado.`);
    }

    // 2. Guardamos la nueva lectura en el historial del nodo
    await this.nodesRepository.updateLastReading(data.nodeId, data);
    
    // 3. Volvemos a obtener el nodo para tener los datos más actualizados
    const updatedNode = await this.nodesRepository.findById(data.nodeId);

    // 4. Revisamos si los nuevos datos deben generar una alerta
    this.checkForAlerts(updatedNode, data);
    
    // 5. Notificamos al frontend con el estado completo y actualizado del nodo
    const nodesService = new NodesService(this.nodesRepository);
    const status = nodesService['calculateNodeStatus'](updatedNode);
    this.eventsGateway.sendNodeUpdate({ ...updatedNode, status });
  }

  private checkForAlerts(node: any, data: IngestDataDto) {
    const { temperatura, fuegoDetectado, humoDetectado, concentracionGas } = data.lectura;

    // Construimos el payload de la alerta usando las coordenadas guardadas del nodo
    const alertPayload = {
      hora: data.timestamp,
      coordenadas: node.coordenadas, // <-- Usamos la ubicación guardada en la BD
      nodo: { id: node.id, nombre: node.nombre },
      userId: node.userId,
    };

    if (fuegoDetectado) {
      this.alertsService.createAlert({ ...alertPayload, tipo: 'Fuego Detectado', severidad: 'Critica' });
    } else if (humoDetectado) {
      this.alertsService.createAlert({ ...alertPayload, tipo: 'Humo Detectado', severidad: 'Alta' });
    } else if (concentracionGas && concentracionGas > 300) {
      this.alertsService.createAlert({ ...alertPayload, tipo: 'Concentración de Gas Elevada', severidad: 'Alta' });
    } else if (temperatura > 65) {
      this.alertsService.createAlert({ ...alertPayload, tipo: 'Temperatura Elevada', severidad: 'Media' });
    }
  }
}
