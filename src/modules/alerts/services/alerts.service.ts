import { Injectable } from '@nestjs/common';
import { AlertsGateway } from '../gateways/alerts.gateway';
import { AlertsRepository } from '../repositories/alerts.repository';

@Injectable()
export class AlertsService {
  constructor(
    private readonly alertsGateway: AlertsGateway,
    private readonly alertsRepository: AlertsRepository,
  ) {}

  async createAlert(alertData: any) {
    console.log('Guardando nueva alerta en la BD:', alertData);
    
    // Ahora sí guardamos la alerta en Firestore usando el repositorio.
    const savedAlert = await this.alertsRepository.create(alertData);

    // Usamos la alerta ya guardada (con su ID real) para notificar.
    this.alertsGateway.sendAlertToAll(savedAlert);

    return savedAlert;
  }

  async findAll(filters: any) {
    return this.alertsRepository.findAll(filters);
  }
}