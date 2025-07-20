// Nuevo archivo: src/modules/nodes/dto/assign-node.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class AssignNodeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}