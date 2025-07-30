import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlertsRepository } from './alerts.repository';
import { FirestoreService } from 'src/common/database/firestore.service';
import {
  CollectionReference,
  DocumentData,
  Query,
} from 'firebase-admin/firestore';
import { QueryAlertsDto } from '../dto/query-alerts.dto'; // Importamos el DTO

@Injectable()
export class FirestoreAlertsRepository
  implements AlertsRepository, OnModuleInit
{
  private _alertsCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: FirestoreService) {}

  onModuleInit() {
    // ==================================================================
    // 2. ADJUNTAR EL CONVERTER A LA COLECCIÓN
    // ==================================================================
    this._alertsCollection = this.firestore.db
      .collection('alerts')
      .withConverter(alertsConverter);
  }

  async create(alertData: any): Promise<any> {
    const docRef = await this._alertsCollection.add(alertData);
    const doc = await docRef.get();
    // El converter ya transforma el resultado, así que solo lo devolvemos
    return doc.data();
  }

  async findAll(filters: QueryAlertsDto) {
    const { page = 1, limit = 10 } = filters;

    let query: Query<DocumentData> = this._alertsCollection;
    // --- Aplicando Filtros ---
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    if (filters.tipo) {
      query = query.where('tipo', '==', filters.tipo);
    }
    
    if (filters.desde) {
      query = query.where('hora', '>=', new Date(filters.desde));
    }
    if (filters.hasta) {
      const hastaDate = new Date(filters.hasta);
      hastaDate.setHours(23, 59, 59, 999);
      query = query.where('hora', '<=', hastaDate);
    }
    
    if (filters.nodeId) {
      query = query.where('nodo.id', '==', filters.nodeId);
    }

    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

    if (total === 0) {
      return { data: [], total: 0 };
    }

    const sortOrder = filters.sort || 'desc';

    const paginatedQuery = query
      .orderBy('hora', sortOrder)
      .limit(limit)
      .offset((page - 1) * limit);

    const dataSnapshot = await paginatedQuery.get();

    const alerts = dataSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));


    return { data: alerts, total };
  }
}
