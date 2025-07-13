export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  id: string;
  nombre: string;
  apellido: string;
  usuario: string;
  correo: string;
  contrasena: string;
  role: UserRole;
}