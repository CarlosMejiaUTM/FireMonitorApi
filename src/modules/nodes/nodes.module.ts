import { Module } from '@nestjs/common';
import { NodesController } from './controllers/nodes.controller';
import { NodesService } from './services/nodes.service';
import { NodesRepository } from './repositories/nodes.repository';
import { FirestoreNodesRepository } from './repositories/firestore-nodes.repository';
// Ya no importamos FirestoreService aquí

@Module({
  controllers: [NodesController],
  providers: [
    NodesService,
    {
      provide: NodesRepository,
      useClass: FirestoreNodesRepository,
    },
  ],
  exports: [NodesRepository],
})
export class NodesModule {}