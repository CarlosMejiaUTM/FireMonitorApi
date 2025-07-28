// src/users/dto/update-user.dto.ts
import { IsString, IsOptional, IsIn, IsNotEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apellido?: string;

  @IsOptional()
  @IsIn([UserRole.ADMIN, UserRole.USER])
  role?: UserRole;
}
