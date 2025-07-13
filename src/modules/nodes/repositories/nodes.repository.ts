import { CreateNodeDto } from '../dto/create-node.dto';
import { UpdateNodeDto } from '../dto/update-node.dto';
import { IngestDataDto } from 'src/modules/ingest/dto/ingest-data.dto';

export abstract class NodesRepository {
  abstract create(data: CreateNodeDto, userId: string): Promise<any>;
  abstract findAll(filters?: { tipo?: string; userId?: string }): Promise<any[]>;
  abstract findAllByUserId(userId: string): Promise<any[]>;
  abstract findById(id: string): Promise<any | null>;
  abstract update(id: string, data: UpdateNodeDto): Promise<any>;
  abstract remove(id: string): Promise<void>;
  abstract updateLastReading(nodeId: string, readingData: IngestDataDto): Promise<void>;
  abstract updateTimestamp(nodeId: string): Promise<void>;
  abstract findHistoryById(nodeId: string): Promise<any[]>;
}