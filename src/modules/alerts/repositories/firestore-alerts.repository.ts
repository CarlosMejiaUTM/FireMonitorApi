import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlertsRepository } from './alerts.repository';
import { FirestoreService } from 'src/common/database/firestore.service';
import { CollectionReference, DocumentData, Query } from 'firebase-admin/firestore';

@Injectable()
export class FirestoreAlertsRepository implements AlertsRepository, OnModuleInit {
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

  async findAll(filters: { tipo?: string; desde?: string; hasta?: string; page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = filters;
    let query: Query<DocumentData> = this._alertsCollection;
    let countQuery: Query<DocumentData> = this._alertsCollection;

    if (filters.tipo) {
      query = query.where('tipo', '==', filters.tipo);
      countQuery = countQuery.where('tipo', '==', filters.tipo);
    }
    if (filters.desde) {
      query = query.where('hora', '>=', filters.desde);
      countQuery = countQuery.where('hora', '>=', filters.desde);
    }
    if (filters.hasta) {
      const hastaDate = new Date(filters.hasta);
      hastaDate.setHours(23, 59, 59, 999);
      query = query.where('hora', '<=', hastaDate.toISOString());
      countQuery = countQuery.where('hora', '<=', hastaDate.toISOString());
    }

    const totalSnapshot = await countQuery.get();
    const total = totalSnapshot.size;

    const paginatedQuery = query.orderBy('hora', 'desc').limit(limit).offset((page - 1) * limit);
    const dataSnapshot = await paginatedQuery.get();

    if (dataSnapshot.empty) {
      return { data: [], total: 0 };
    }

    const alerts: any[] = [];
    dataSnapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() });
    });

    return { data: alerts, total };
  }
}