import { Module } from '@nestjs/common';
import { AlertsService } from './services/alerts.service';
import { AlertsGateway } from './gateways/alerts.gateway';
import { AlertsController } from './controllers/alerts.controller';
import { AlertsRepository } from './repositories/alerts.repository';
import { FirestoreAlertsRepository } from './repositories/firestore-alerts.repository';
// Ya no importamos FirestoreService aquí

@Module({
  controllers: [AlertsController],
  providers: [
    AlertsGateway,
    AlertsService,
    {
      provide: AlertsRepository,
      useClass: FirestoreAlertsRepository,
    },
  ],
  exports: [AlertsService, AlertsGateway],
})
export class AlertsModule {}