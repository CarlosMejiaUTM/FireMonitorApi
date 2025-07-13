import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private _db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const credentialsPath = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );

    if (!credentialsPath) {
      throw new InternalServerErrorException(
        'La variable GOOGLE_APPLICATION_CREDENTIALS no está definida en el archivo .env',
      );
    }

    const serviceAccountPath = path.join(process.cwd(), credentialsPath);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log('✅ Firebase Admin inicializado correctamente.');
    }

    this._db = admin.firestore();

   
    this._db.settings({
      ignoreUndefinedProperties: true,
    });
  }

  get db(): admin.firestore.Firestore {
    return this._db;
  }
}