import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/modules/users/repositories/users.repository';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByUsername(createUserDto.usuario);
    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya existe');
    }
    return this.usersRepository.create(createUserDto, UserRole.USER);
  }
  
  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByUsername(loginDto.usuario);

    if (user && (await bcrypt.compare(loginDto.contrasena, user.contrasena))) {
      const payload = { usuario: user.usuario, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Credenciales incorrectas');
  }
}