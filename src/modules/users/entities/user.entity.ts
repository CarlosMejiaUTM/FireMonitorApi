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
  token: string;
  role: UserRole;
}
