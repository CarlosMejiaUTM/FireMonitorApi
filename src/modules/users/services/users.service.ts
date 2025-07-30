import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity'; // <-- IMPORTACIÓN AÑADIDA

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    return this.usersRepository.findAll();
  }
  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'contrasena'>> {
    return this.usersRepository.update(id, updateUserDto);
  }
}
