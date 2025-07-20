import { Injectable } from '@nestjs/common';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { AlertsGateway } from '../gateways/alerts.gateway';
import { AlertsRepository } from '../repositories/alerts.repository';
import { QueryAlertsDto } from '../dto/query-alerts.dto';

@Injectable()
export class AlertsService {
  constructor(
    private readonly alertsGateway: AlertsGateway,
    private readonly alertsRepository: AlertsRepository,
  ) {}

  async createAlert(alertData: any) {
    const savedAlert = await this.alertsRepository.create(alertData);
    this.alertsGateway.sendAlertToAll(savedAlert);
    return savedAlert;
  }

  async findAll(filters: QueryAlertsDto, user: User) {
    const repositoryFilters: any = { ...filters };

    if (user.role !== UserRole.ADMIN) {
      repositoryFilters.userId = user.id;
    }

    return this.alertsRepository.findAll(repositoryFilters);
  }
}
