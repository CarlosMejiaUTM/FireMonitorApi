import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsOptional,
  IsNumber,
  IsBoolean, // <-- Se añade IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

// Clase CoordinatesDto (sin cambios)
export class CoordinatesDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

// Enum NodeType (sin cambios)
export enum NodeType {
  SENSOR = 'sensor',
  REPETIDOR = 'repetidor',
  CENTRAL = 'central',
}

// ✅ CORRECCIÓN APLICADA AQUÍ
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

  @IsString()
  @IsOptional()
  userId?: string;

  // Propiedades opcionales del sensor añadidas
  @IsOptional()
  @IsNumber()
  temperatura?: number;

  @IsOptional()
  @IsBoolean()
  humoDetectado?: boolean;

  @IsOptional()
  @IsBoolean()
  fuegoDetectado?: boolean;

  @IsOptional()
  @IsNumber()
  concentracionGas?: number;
}