import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() apellido: string;
  @IsString() @IsNotEmpty() usuario: string;
  @IsEmail() @IsNotEmpty() correo: string;
  @IsString() @MinLength(6) contrasena: string;
}