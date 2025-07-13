import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserRole } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract create(createUserDto: CreateUserDto, role: UserRole): Promise<Omit<User, 'contrasena'>>;
  abstract findByUsername(usuario: string): Promise<User | null>;
}