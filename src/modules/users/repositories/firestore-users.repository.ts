import { Injectable, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { FirestoreService } from 'src/common/database/firestore.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class FirestoreUsersRepository implements UsersRepository, OnModuleInit {
  private _usersCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: FirestoreService) {}

  onModuleInit() {
    this._usersCollection = this.firestore.db.collection('users');
  }

  async create(createUserDto: CreateUserDto, role: UserRole): Promise<Omit<User, 'contrasena'>> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.contrasena, salt);

    const newUser = {
      nombre: createUserDto.nombre,
      apellido: createUserDto.apellido,
      usuario: createUserDto.usuario,
      correo: createUserDto.correo,
      contrasena: hashedPassword,
      role,
    };
    
    const docRef = await this._usersCollection.add(newUser);
    
    const { contrasena, ...userWithoutPassword } = newUser;
    return { id: docRef.id, ...userWithoutPassword };
  }
      
  async findByUsername(usuario: string): Promise<User | null> {
    const snapshot = await this._usersCollection.where('usuario', '==', usuario).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async findByEmail(correo: string): Promise<User | null> {
    const snapshot = await this._usersCollection.where('correo', '==', correo).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  // --- MÉTODO AÑADIDO ---
  async findAll(): Promise<Omit<User, 'contrasena'>[]> {
    const snapshot = await this._usersCollection.get();
    if (snapshot.empty) {
      return [];
    }
    const users: Omit<User, 'contrasena'>[] = [];
    snapshot.forEach(doc => {
      // Excluimos la contraseña de la respuesta por seguridad
      const { contrasena, ...userWithoutPassword } = doc.data();
      users.push({ id: doc.id, ...userWithoutPassword } as Omit<User, 'contrasena'>);
    });
    return users;
  }

  async saveResetToken(userId: string, token: string, expires: Date): Promise<void> {
    const userRef = this._usersCollection.doc(userId);
    await userRef.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires.toISOString(),
    });
  }

  async findUserByResetToken(token: string): Promise<User | null> {
    const snapshot = await this._usersCollection.where('resetPasswordToken', '==', token).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async updatePassword(userId: string, newHashedPassword: string): Promise<void> {
    const userRef = this._usersCollection.doc(userId);
    await userRef.update({
      contrasena: newHashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}
