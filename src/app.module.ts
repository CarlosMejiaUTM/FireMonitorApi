import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NodesModule } from './modules/nodes/nodes.module';
import { IngestModule } from './modules/ingest/ingest.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    NodesModule,
    IngestModule,
    AlertsModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}