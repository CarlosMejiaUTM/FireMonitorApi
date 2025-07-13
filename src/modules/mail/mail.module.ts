import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global() // Hacemos el módulo global para que cualquier servicio pueda usar MailService
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}