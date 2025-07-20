import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// Definimos las coordenadas en su propia clase para reutilizarla
export class CoordinatesDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

export enum NodeType {
  SENSOR = 'sensor',
  REPETIDOR = 'repetidor',
  CENTRAL = 'central',
}

export class CreateNodeDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(NodeType)
  @IsNotEmpty()
  tipo: NodeType;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  coordenadas: CoordinatesDto;

  // Este campo es opcional. Solo lo usará un admin para asignar el nodo a otro usuario.
  @IsString()
  @IsOptional()
  userId?: string;
}
