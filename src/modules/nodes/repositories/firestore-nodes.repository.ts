import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodesRepository } from './nodes.repository';
import { CreateNodeDto } from '../dto/create-node.dto';
import { UpdateNodeDto } from '../dto/update-node.dto';
import { FirestoreService } from 'src/common/database/firestore.service';
import { CollectionReference, DocumentData, Query, QueryDocumentSnapshot, FirestoreDataConverter } from 'firebase-admin/firestore';
import { IngestDataDto } from 'src/modules/ingest/dto/ingest-data.dto';
import { CoordinatesDto } from '../dto/coordinates.dto';

// ==================================================================
// 1. DEFINIR EL CONVERTER PARA LOS NODOS Y SUS LECTURAS
// ==================================================================

// Converter para los documentos de la colección principal 'nodes'
const nodeConverter: FirestoreDataConverter<any> = {
  toFirestore(node: any): DocumentData {
    return node;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): any {
    const data = snapshot.data();
    
    // Lógica de seguridad para convertir Timestamps a Dates al leer
    const createdAt = (data.createdAt && typeof data.createdAt.toDate === 'function') ? data.createdAt.toDate() : null;
    const ultimaActualizacion = (data.ultimaActualizacion && typeof data.ultimaActualizacion.toDate === 'function') ? data.ultimaActualizacion.toDate() : null;
    
    // ✅ CORRECCIÓN FINAL: Nos aseguramos de convertir también la fecha anidada en 'ultimaLectura'
    let ultimaLectura = data.ultimaLectura || null;
    if (ultimaLectura && ultimaLectura.timestamp && typeof ultimaLectura.timestamp.toDate === 'function') {
      ultimaLectura = {
        ...ultimaLectura,
        timestamp: ultimaLectura.timestamp.toDate(),
      };
    }

    return {
      id: snapshot.id,
      ...data,
      createdAt,
      ultimaActualizacion,
      ultimaLectura, // Devolvemos la versión con la fecha ya convertida
    };
  }
};

// Converter para los documentos de la subcolección 'readings'
const readingConverter: FirestoreDataConverter<any> = {
    toFirestore(reading: any): DocumentData {
        return reading;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): any {
        const data = snapshot.data();
        const timestamp = (data.timestamp && typeof data.timestamp.toDate === 'function') ? data.timestamp.toDate() : null;
        return {
            id: snapshot.id,
            ...data,
            timestamp,
        };
    }
};

@Injectable()
export class FirestoreNodesRepository implements NodesRepository, OnModuleInit {
  private _nodesCollection: CollectionReference<any>;

  constructor(private readonly firestore: FirestoreService) {}

  onModuleInit() {
    this._nodesCollection = this.firestore.db.collection('nodes').withConverter(nodeConverter);
  }

  async create(data: CreateNodeDto, userId: string): Promise<any> {
    const nodeToSave = {
      nombre: data.nombre,
      tipo: data.tipo,
      coordenadas: { ...data.coordenadas },
      userId: userId,
      createdAt: new Date(),
    };
    const docRef = await this._nodesCollection.add(nodeToSave);
    const doc = await docRef.get();
    return doc.data();
  }

  async findAll(filters: { tipo?: string; userId?: string } = {}): Promise<any[]> {
    let query: Query<DocumentData> = this._nodesCollection;
    if (filters.tipo) {
      query = query.where('tipo', '==', filters.tipo);
    }
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
  }

  async findAllByUserId(userId: string): Promise<any[]> {
    const snapshot = await this._nodesCollection.where('userId', '==', userId).get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.data());
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this._nodesCollection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  async update(id: string, data: UpdateNodeDto): Promise<any> {
    const nodeRef = this._nodesCollection.doc(id);
    await nodeRef.update({ ...data });
    const updatedDoc = await nodeRef.get();
    return updatedDoc.data();
  }

  async remove(id: string): Promise<void> {
    await this._nodesCollection.doc(id).delete();
  }

  async assignUser(nodeId: string, userId: string): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);
    await nodeRef.update({
      userId: userId,
      ultimaActualizacion: new Date(),
    });
  }

  async updateLastReading(nodeId: string, data: IngestDataDto): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);
    const readingsRef = nodeRef.collection('readings').withConverter(readingConverter);
    const plainReading = { ...data.lectura, timestamp: data.timestamp };
    await readingsRef.add(plainReading);
    await nodeRef.update({
      ultimaLectura: plainReading,
      ultimaActualizacion: data.timestamp,
    });
  }
  
  async updateTimestamp(nodeId: string): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);
    await nodeRef.update({ ultimaActualizacion: new Date() });
  }

  async findHistoryById(nodeId: string): Promise<any[]> {
    const historyRef = this._nodesCollection.doc(nodeId).collection('readings').withConverter(readingConverter);
    const snapshot = await historyRef.orderBy('timestamp', 'desc').limit(20).get();
    return snapshot.docs.map(doc => doc.data());
  }

  async updateCoordinates(nodeId: string, coordenadas: CoordinatesDto): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);
    await nodeRef.update({
      coordenadas: { ...coordenadas },
      ultimaActualizacion: new Date(),
    });
  }
}
