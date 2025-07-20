import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlertsRepository } from './alerts.repository';
import { FirestoreService } from 'src/common/database/firestore.service';
import { CollectionReference, DocumentData, Query, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase-admin/firestore';
import { QueryAlertsDto } from '../dto/query-alerts.dto';


const alertsConverter: FirestoreDataConverter<any> = {

  toFirestore(alert: any): DocumentData {

    return alert;
  },


  fromFirestore(snapshot: QueryDocumentSnapshot): any {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
      // Convierte el Timestamp de Firestore a un objeto Date de JS
      // para que el resto de la aplicación pueda usarlo.
      hora: data.hora.toDate() 
    };
  }
};


@Injectable()
export class FirestoreAlertsRepository implements AlertsRepository, OnModuleInit {
  // La colección ahora estará fuertemente tipada con el converter
  private _alertsCollection: CollectionReference<any>;

  constructor(private readonly firestore: FirestoreService) {}

  onModuleInit() {

    this._alertsCollection = this.firestore.db
      .collection('alerts')
      .withConverter(alertsConverter); // <-- ¡Esta es la clave!
  }

  async create(alertData: any): Promise<any> {
    // Ahora 'create' usará automáticamente el método 'toFirestore' del converter
    const docRef = await this._alertsCollection.add(alertData);
    // Y '.get()' usará automáticamente el método 'fromFirestore'
    return await docRef.get();
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
    
    // La lógica de fechas sigue siendo necesaria para la consulta
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

    // Gracias al converter, ya no necesitas el .map() para transformar los datos
    const alerts = dataSnapshot.docs.map(doc => doc.data());

    return { data: alerts, total };
  }
}
