import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService implements OnModuleInit {
  private _db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const base64Credentials = this.configService.get<string>('GCP_CREDENTIALS_BASE64');

    if (!base64Credentials) {
      throw new InternalServerErrorException(
        'La variable GCP_CREDENTIALS_BASE64 no está definida en el archivo .env',
      );
    }

    // Decodificamos la cadena base64 a JSON
    const serviceAccount = JSON.parse(Buffer.from(base64Credentials, 'base64').toString('utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
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
