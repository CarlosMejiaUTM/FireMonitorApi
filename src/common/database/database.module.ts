import { Module, Global } from '@nestjs/common';
import { FirestoreService } from './firestore.service';
import { ConfigService } from '@nestjs/config';

@Global() // <-- La clave: hace que este módulo sea global
@Module({
  providers: [FirestoreService, ConfigService],
  exports: [FirestoreService], // Exportamos el servicio para que otros módulos lo usen
})
export class DatabaseModule {}