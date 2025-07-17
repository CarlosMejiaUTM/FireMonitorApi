import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodesRepository } from './nodes.repository';
import { CreateNodeDto, CoordinatesDto } from '../dto/create-node.dto';
import { UpdateNodeDto } from '../dto/update-node.dto';
import { FirestoreService } from 'src/common/database/firestore.service';
import { CollectionReference, DocumentData, Query } from 'firebase-admin/firestore';
import { IngestDataDto } from 'src/modules/ingest/dto/ingest-data.dto';

@Injectable()
export class FirestoreNodesRepository implements NodesRepository, OnModuleInit {
  private _nodesCollection: CollectionReference<DocumentData>;

  constructor(private readonly firestore: FirestoreService) {}

  onModuleInit() {
    this._nodesCollection = this.firestore.db.collection('nodes');
  }

  async create(data: CreateNodeDto, userId: string): Promise<any> {
    const nodeToSave = {
      nombre: data.nombre,
      tipo: data.tipo,
      coordenadas: { ...data.coordenadas },
      userId: userId, // Guardamos el ID del dueño
      createdAt: new Date().toISOString(),
    };
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
    await nodeRef.collection('readings').add({
      ...plainReading,
      timestamp: data.timestamp,
    });
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

  async updateCoordinates(nodeId: string, coordenadas: CoordinatesDto): Promise<void> {
    const nodeRef = this._nodesCollection.doc(nodeId);
    const plainCoordinates = { ...coordenadas };
    await nodeRef.update({
      coordenadas: plainCoordinates,
      ultimaActualizacion: new Date().toISOString(),
    });
  }
}
