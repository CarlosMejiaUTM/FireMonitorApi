import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  contrasena: string;

  @IsOptional() // ✅ Propiedad añadida
  @IsString()
  fcmToken: string; // Renombrado para mayor claridad
}