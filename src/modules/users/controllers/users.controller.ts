import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User, UserRole } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@GetUser() user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta lista.',
      );
    }
    return this.usersService.findAll();
  }
}
