import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

/**
 * DTO para el objeto anidado "lectura"
 */
class LecturaDto {
  @IsNumber()
  temperatura: number;

  @IsNumber()
  humedad: number;

  @IsBoolean()
  humoDetectado: boolean;

  @IsBoolean()
  fuegoDetectado: boolean;

  @IsNumber()
  @IsOptional()
  concentracionGas: number;
}

/**
 * DTO para el objeto anidado "coordenadas"
 */
class CoordenadasDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

/**
 * DTO principal que recibe el controlador.
 * Genera el timestamp automáticamente y valida toda la estructura.
 */
export class IngestDataDto {
  @IsOptional()
  @IsDate()
  timestamp: Date = new Date();

  @IsNotEmpty()
  nodeId: string;

  @ValidateNested()
  @Type(() => LecturaDto)
  lectura: LecturaDto;

  @ValidateNested()
  @Type(() => CoordenadasDto)
  coordenadas: CoordenadasDto;
}