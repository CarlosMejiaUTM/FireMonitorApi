import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserRole } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract create(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<Omit<User, 'contrasena'>>;
  abstract findByUsername(usuario: string): Promise<User | null>;
  abstract findByEmail(correo: string): Promise<User | null>;
  abstract findAll(): Promise<Omit<User, 'contrasena'>[]>;

  // --- MÉTODOS AÑADIDOS ---
  abstract saveResetToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<void>;
  abstract findUserByResetToken(token: string): Promise<User | null>;
  abstract updatePassword(
    userId: string,
    newHashedPassword: string,
  ): Promise<void>;
}
