import { Module } from '@nestjs/common';
import { IngestController } from './controllers/ingest.controller';
import { IngestService } from './services/ingest.service';
import { NodesModule } from '../nodes/nodes.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [NodesModule, AlertsModule],
  controllers: [IngestController],
  providers: [IngestService],
})
export class IngestModule {}
