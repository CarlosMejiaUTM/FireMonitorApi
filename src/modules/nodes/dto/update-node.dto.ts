import { PartialType } from '@nestjs/mapped-types';
import { CreateNodeDto } from './create-node.dto';

// PartialType toma todas las reglas de CreateNodeDto y las hace opcionales.
// Perfecto para las peticiones de actualización (PATCH).
export class UpdateNodeDto extends PartialType(CreateNodeDto) {}
