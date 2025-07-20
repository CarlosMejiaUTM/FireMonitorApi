import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { NodesRepository } from '../repositories/nodes.repository';
import { CreateNodeDto } from '../dto/create-node.dto';
import { UpdateNodeDto } from '../dto/update-node.dto';
import { User, UserRole } from 'src/modules/users/entities/user.entity';

@Injectable()
export class NodesService {
  constructor(private readonly nodesRepository: NodesRepository) {}

  create(createNodeDto: CreateNodeDto, requestingUser: User) {
    // 1. Verificamos si el que hace la petición es un ADMIN.
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden crear nuevos nodos.');
    }

    // 2. Determinamos el dueño del nodo.
    // Si el admin especificó un 'userId' en el body, ese es el dueño.
    // Si no, el dueño es el propio admin que hace la petición.
    const ownerId = createNodeDto.userId || requestingUser.id;

    return this.nodesRepository.create(createNodeDto, ownerId);
  }

  async findAll(filters?: { tipo?: string; userId?: string }) {
    const nodes = await this.nodesRepository.findAll(filters);
    return nodes.map(node => ({ ...node, status: this.calculateNodeStatus(node) }));
  }

  async findAllByUserId(userId: string, tipo?: string) {
    const filters = { userId, tipo };
    const nodes = await this.nodesRepository.findAll(filters);
    return nodes.map(node => ({ ...node, status: this.calculateNodeStatus(node) }));
  }

  async findOne(id: string, user: User) {
    const node = await this.nodesRepository.findById(id);
    if (!node) throw new NotFoundException(`Nodo con ID "${id}" no encontrado.`);
    if (user.role !== UserRole.ADMIN && node.userId !== user.id) {
      throw new UnauthorizedException('No tienes permiso para acceder a este nodo.');
    }
    return { ...node, status: this.calculateNodeStatus(node) };
  }
  
  async update(id: string, updateNodeDto: UpdateNodeDto, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('Solo los administradores pueden modificar nodos.');
    await this.findOne(id, user);
    return this.nodesRepository.update(id, updateNodeDto);
  }

  async remove(id: string, user: User) {
    if (user.role !== UserRole.ADMIN) throw new ForbiddenException('Solo los administradores pueden eliminar nodos.');
    await this.findOne(id, user);
    return this.nodesRepository.remove(id);
  }

  async findHistory(id: string, user: User) {
    await this.findOne(id, user);
    return this.nodesRepository.findHistoryById(id);
  }

  async handleHeartbeat(nodeId: string, user: User) {
    await this.findOne(nodeId, user);
    return this.nodesRepository.updateTimestamp(nodeId);
  }

  // ✅ NUEVO MÉTODO PARA ASIGNAR UN NODO
  async assignUserToNode(nodeId: string, userId: string): Promise<void> {
    // Primero, verificamos que el nodo exista para dar un error claro
    const node = await this.nodesRepository.findById(nodeId);
    if (!node) {
      throw new NotFoundException(`El nodo con ID "${nodeId}" no fue encontrado.`);
    }
    
    // Aquí también podrías verificar si el usuario existe si tienes un `usersRepository`
    
    return this.nodesRepository.assignUser(nodeId, userId);
  }

  private calculateNodeStatus(node: any): 'alerta' | 'activo' | 'inactivo' {
    if (!node.ultimaActualizacion) return 'inactivo';
    
    // Asegurarnos de que 'ultimaActualizacion' es un objeto Date
    const lastUpdate = (node.ultimaActualizacion instanceof Date)
      ? node.ultimaActualizacion
      : new Date(node.ultimaActualizacion);

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    if (lastUpdate < thirtyMinutesAgo) return 'inactivo';
    if (node.tipo !== 'sensor' || !node.ultimaLectura) return 'activo';
    
    const { fuegoDetectado, temperatura, humoDetectado, concentracionGas } = node.ultimaLectura;
    
    if (fuegoDetectado || humoDetectado || (concentracionGas && concentracionGas > 300) || temperatura > 65) {
      return 'alerta';
    }
    return 'activo';
  }
}
