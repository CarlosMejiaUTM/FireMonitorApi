import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodesRepository } from './nodes.repository';
import { CreateNodeDto } from '../dto/create-node.dto';
import { UpdateNodeDto } from '../dto/update-node.dto';
import { FirestoreService } from 'src/common/database/firestore.service';
import { CollectionReference, DocumentData, Query } from 'firebase-admin/firestore';
import { IngestDataDto, CoordenadasDto } from 'src/modules/ingest/dto/ingest-data.dto';

@Injectable()
export class FirestoreNodesRepository implements NodesRepository, OnModuleInit {
  private _nodesCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: FirestoreService) {}

  onModuleInit() {
    this._nodesCollection = this.firestore.db.collection('nodes');
  }

  async create(data: CreateNodeDto, userId?: string): Promise<any> {
    const nodeToSave: any = {
      nombre: data.nombre,
      tipo: data.tipo,
      coordenadas: { ...data.coordenadas },
      createdAt: new Date().toISOString(),
    };
    if (userId) {
      nodeToSave.userId = userId;
    }
    const docRef = await this._nodesCollection.add(nodeToSave);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
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
    if (snapshot.empty) return [];
    const nodes: any[] = [];
    snapshot.forEach(doc => {
      nodes.push({ id: doc.id, ...doc.data() });
    });
    return nodes;
  }

  async findAllByUserId(userId: string): Promise<any[]> {
    const snapshot = await this._nodesCollection.where('userId', '==', userId).get();
    if (snapshot.empty) return [];
    const nodes: any[] = [];
    snapshot.forEach(doc => {
      nodes.push({ id: doc.id, ...doc.data() });
    });
    return nodes;
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this._nodesCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateNodeDto): Promise<any> {
    const nodeRef = this._nodesCollection.doc(id);
    await nodeRef.update({ ...data });
    const updatedDoc = await nodeRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  async remove(id: string): Promise<void> {
    await this._nodesCollection.doc(id).delete();
  }

  async updateLastReading(nodeId: string, data: IngestDataDto): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);
    const plainReading = { ...data.lectura };

    // Guardamos la lectura en una subcolección para el historial
    await nodeRef.collection('readings').add({
      ...plainReading,
      timestamp: data.timestamp,
    });

    // Actualizamos solo la última lectura y la fecha en el documento principal
    await nodeRef.update({
      ultimaLectura: plainReading,
      ultimaActualizacion: data.timestamp,
    });
  }

  async updateTimestamp(nodeId: string): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);
    await nodeRef.update({
      ultimaActualizacion: new Date().toISOString(),
    });
  }

  async findHistoryById(nodeId: string): Promise<any[]> {
    const historyRef = this._nodesCollection.doc(nodeId).collection('readings');
    const snapshot = await historyRef.orderBy('timestamp', 'desc').limit(20).get();
    if (snapshot.empty) return [];
    const history: any[] = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });
    return history;
  }

  // Método corregido para actualizar coordenadas sin error Firestore
  async updateCoordinates(nodeId: string, coordenadas: CoordenadasDto): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);

    // Convertimos la instancia a objeto plano para evitar error de Firestore
    const plainCoordinates = { ...coordenadas };

    await nodeRef.update({
      coordenadas: plainCoordinates,
      ultimaActualizacion: new Date().toISOString(),
    });
  }
}
