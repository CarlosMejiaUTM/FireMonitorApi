import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { FirestoreUsersRepository } from './repositories/firestore-users.repository';

@Module({
  providers: [
    {
      provide: UsersRepository,
      useClass: FirestoreUsersRepository,
    },
  ],
  exports: [UsersRepository], // Exportamos para que AuthModule pueda usarlo
})
export class UsersModule {}