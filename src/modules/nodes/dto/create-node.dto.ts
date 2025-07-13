// src/modules/nodes/dto/create-node.dto.ts
import { IsString, IsNotEmpty, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum NodeType {
  SENSOR = 'sensor',
  REPETIDOR = 'repetidor',
  CENTRAL = 'central',
}

export class CoordinatesDto {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;
}

export class CreateNodeDto {
  @IsString() @IsNotEmpty() nombre: string;

  @IsEnum(NodeType) @IsNotEmpty() tipo: NodeType;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  coordenadas: CoordinatesDto;

  @IsString()
  @IsOptional()
  userId?: string;
}
