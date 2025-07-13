import { Injectable, NotFoundException } from '@nestjs/common';
import { IngestDataDto } from '../dto/ingest-data.dto';
import { NodesRepository } from 'src/modules/nodes/repositories/nodes.repository';
import { AlertsService } from 'src/modules/alerts/services/alerts.service';
import { AlertsGateway } from 'src/modules/alerts/gateways/alerts.gateway';

@Injectable()
export class IngestService {
  constructor(
    private readonly nodesRepository: NodesRepository,
    private readonly alertsService: AlertsService,
    private readonly eventsGateway: AlertsGateway,
  ) {}

  async processData(data: IngestDataDto): Promise<void> {
    const nodeExists = await this.nodesRepository.findById(data.nodeId);
    if (!nodeExists) {
      throw new NotFoundException(`Nodo con ID "${data.nodeId}" no encontrado.`);
    }

    await this.nodesRepository.updateLastReading(data.nodeId, data);
    const updatedNode = await this.nodesRepository.findById(data.nodeId);

    // Esta línea ahora funcionará porque el método existe dentro de la clase
    this.checkForAlerts(updatedNode, data);
    
    const status = this.calculateNodeStatus(updatedNode);
    this.eventsGateway.sendNodeUpdate({ ...updatedNode, status });
  }

  // MÉTODO QUE FALTABA:
  private checkForAlerts(node: any, data: IngestDataDto) {
    const { temperatura, fuegoDetectado, humoDetectado, concentracionGas } = data.lectura;

    const alertPayload = {
      hora: data.timestamp,
      coordenadas: node.coordenadas,
      nodo: { id: node.id, nombre: node.nombre },
    };

    if (fuegoDetectado) {
      this.alertsService.createAlert({
        ...alertPayload,
        tipo: 'Fuego Detectado',
        severidad: 'Critica',
      });
    } else if (humoDetectado) {
      this.alertsService.createAlert({
        ...alertPayload,
        tipo: 'Humo Detectado',
        severidad: 'Alta',
      });
    } else if (concentracionGas && concentracionGas > 300) {
      this.alertsService.createAlert({
        ...alertPayload,
        tipo: 'Concentración de Gas Elevada',
        severidad: 'Alta',
      });
    } else if (temperatura > 65) {
      this.alertsService.createAlert({
        ...alertPayload,
        tipo: 'Temperatura Elevada',
        severidad: 'Media',
      });
    }
  }

  // MÉTODO QUE TAMBIÉN FALTABA:
  private calculateNodeStatus(node: any): 'alerta' | 'activo' | 'inactivo' {
    if (node.tipo !== 'sensor' || !node.ultimaLectura) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (new Date(node.ultimaActualizacion) < thirtyMinutesAgo) return 'inactivo';
      return 'activo';
    }
    const { fuegoDetectado, temperatura, humoDetectado, concentracionGas } = node.ultimaLectura;
    if (fuegoDetectado || humoDetectado || (concentracionGas && concentracionGas > 300) || temperatura > 65) {
      return 'alerta';
    }
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (new Date(node.ultimaActualizacion) < thirtyMinutesAgo) return 'inactivo';
    return 'activo';
  }
}