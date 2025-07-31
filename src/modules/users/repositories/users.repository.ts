import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserRole } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

export abstract class UsersRepository {
  abstract create(createUserDto: CreateUserDto, role: UserRole): Promise<Omit<User, 'contrasena'>>;
  abstract findByUsername(usuario: string): Promise<User | null>;
  abstract findByEmail(correo: string): Promise<User | null>;
  abstract findAll(): Promise<Omit<User, 'contrasena'>[]>;
  abstract saveResetToken(userId: string, token: string, expires: Date): Promise<void>;
  abstract findUserByResetToken(token: string): Promise<User | null>;
  abstract updatePassword(userId: string, newHashedPassword: string): Promise<void>;
  abstract updateToken(userId: string, token:string): Promise<void>;
  abstract update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'contrasena'>>;
}