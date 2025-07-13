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
    // Si el admin especificó un 'userId', ese es el dueño. Si no, el dueño es el propio admin.
    const ownerId = createNodeDto.userId || requestingUser.id;

    return this.nodesRepository.create(createNodeDto, ownerId);
  }

  async findAll() {
    const nodes = await this.nodesRepository.findAll();
    return nodes.map(node => ({
      ...node,
      status: this.calculateNodeStatus(node),
    }));
  }

  async findAllByUserId(userId: string) {
    const nodes = await this.nodesRepository.findAllByUserId(userId);
    return nodes.map(node => ({
      ...node,
      status: this.calculateNodeStatus(node),
    }));
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const node = await this.nodesRepository.findById(id);
    if (!node) {
      throw new NotFoundException(`Nodo con ID "${id}" no encontrado.`);
    }

    if (userRole !== UserRole.ADMIN && node.userId !== userId) {
      throw new UnauthorizedException('No tienes permiso para acceder a este nodo.');
    }

    return { ...node, status: this.calculateNodeStatus(node) };
  }
  
  async update(id: string, updateNodeDto: UpdateNodeDto, user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden modificar nodos.');
    }
    await this.findOne(id, user.id, user.role); // Reutilizamos para verificar que existe y (en teoría) el permiso
    return this.nodesRepository.update(id, updateNodeDto);
  }

  async remove(id: string, user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo los administradores pueden eliminar nodos.');
    }
    await this.findOne(id, user.id, user.role); // Reutilizamos para verificar que existe
    return this.nodesRepository.remove(id);
  }

  async findHistory(id: string, userId: string, userRole: UserRole) {
    await this.findOne(id, userId, userRole);
    return this.nodesRepository.findHistoryById(id);
  }

  async handleHeartbeat(nodeId: string, userId: string, userRole: UserRole) {
    await this.findOne(nodeId, userId, userRole);
    return this.nodesRepository.updateTimestamp(nodeId);
  }

  private calculateNodeStatus(node: any): 'alerta' | 'activo' | 'inactivo' {
    if (!node.ultimaActualizacion) return 'inactivo';
    
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (new Date(node.ultimaActualizacion) < thirtyMinutesAgo) {
      return 'inactivo';
    }

    if (node.tipo !== 'sensor' || !node.ultimaLectura) {
      return 'activo';
    }

    const { fuegoDetectado, temperatura, humoDetectado, concentracionGas } = node.ultimaLectura;
    if (fuegoDetectado || humoDetectado || (concentracionGas && concentracionGas > 300) || temperatura > 65) {
      return 'alerta';
    }

    return 'activo';
  }
}