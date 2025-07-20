import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { FirestoreUsersRepository } from './repositories/firestore-users.repository';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: FirestoreUsersRepository,
    },
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
