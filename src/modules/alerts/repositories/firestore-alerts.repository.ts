import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlertsRepository } from './alerts.repository';
import { FirestoreService } from 'src/common/database/firestore.service';
import { CollectionReference, DocumentData, Query, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase-admin/firestore';
import { QueryAlertsDto } from '../dto/query-alerts.dto';


const alertsConverter: FirestoreDataConverter<any> = {

  toFirestore(alert: any): DocumentData {
    // Pasa el objeto Date directamente. El SDK lo convierte a Timestamp.
    return alert;
  },

  /**
   * fromFirestore: Se ejecuta DESPUÉS de leer un documento.
   */
  fromFirestore(snapshot: QueryDocumentSnapshot): any {
    const data = snapshot.data();

    // ✅ CORRECCIÓN: Hacemos el código robusto contra datos viejos.
    // Verificamos si 'data.hora' es un Timestamp de Firestore antes de convertirlo.
    const hora = (data.hora && typeof data.hora.toDate === 'function') 
      ? data.hora.toDate() // Si es un Timestamp, lo convertimos a Date
      : new Date();      // Si no (es un string viejo), usamos una fecha por defecto para evitar que se caiga.

    return {
      id: snapshot.id,
      ...data,
      hora: hora, // Usamos la fecha convertida de forma segura.
    };
  }
};


@Injectable()
export class FirestoreAlertsRepository implements AlertsRepository, OnModuleInit {
  private _alertsCollection: CollectionReference<any>;

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
    
    let query: Query<any> = this._alertsCollection;

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
    
    // Gracias al converter, ya no necesitas el .map()
    const alerts = dataSnapshot.docs.map(doc => doc.data());

    return { data: alerts, total };
  }
}
