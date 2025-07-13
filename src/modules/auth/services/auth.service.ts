import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/modules/users/repositories/users.repository';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UserRole } from 'src/modules/users/entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { MailService } from 'src/modules/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Validar que el nombre de usuario no exista
    const existingUserByUsername = await this.usersRepository.findByUsername(createUserDto.usuario);
    if (existingUserByUsername) {
      throw new ConflictException('El nombre de usuario ya existe');
    }

    // Validar que el correo no exista
    const existingUserByEmail = await this.usersRepository.findByEmail(createUserDto.correo);
    if (existingUserByEmail) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    // Crear el usuario
    const newUser = await this.usersRepository.create(createUserDto, UserRole.USER);

    // Enviar el correo de bienvenida
    await this.mailService.sendUserWelcomeEmail(newUser);

    // Devolver el usuario creado
    return newUser;
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