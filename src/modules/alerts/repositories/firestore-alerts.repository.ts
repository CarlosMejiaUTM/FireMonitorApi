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
    this._alertsCollection = this.firestore.db.collection('alerts');
  }

  async create(alertData: any): Promise<any> {
    const docRef = await this._alertsCollection.add(alertData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  // El tipo de 'filters' ahora es el DTO para mayor seguridad
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
      query = query.where('hora', '>=', filters.desde);
    }
    if (filters.hasta) {
      const hastaDate = new Date(filters.hasta);
      hastaDate.setHours(23, 59, 59, 999);
      query = query.where('hora', '<=', hastaDate.toISOString());
    }
    // MEJORA: Filtro por nodeId corregido para usar un campo de nivel superior
    if (filters.nodeId) {
      query = query.where('nodeId', '==', filters.nodeId);
    }

    // MEJORA: Conteo eficiente usando getCount()
    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

    if (total === 0) {
      return { data: [], total: 0 };
    }

    // MEJORA: Ordenamiento dinámico
    const sortOrder = filters.sort || 'desc'; // Default a 'desc' si no se especifica

    const paginatedQuery = query
      .orderBy('hora', sortOrder) // Se usa el sortOrder dinámico
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
