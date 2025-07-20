import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

// DTO para el objeto anidado "lectura"
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
  concentracionGas: number;
}

// DTO para el objeto anidado "coordenadas"
class CoordenadasDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

// DTO principal
export class IngestDataDto {
  // ✅ TIMESTAMP AUTOMÁTICO
  timestamp: Date = new Date();

  @IsNotEmpty()
  nodeId: string;

  @ValidateNested() // Le dice a NestJS que valide también el objeto anidado
  @Type(() => LecturaDto) // Necesario para la transformación del objeto
  lectura: LecturaDto;

  @ValidateNested()
  @Type(() => CoordenadasDto)
  coordenadas: CoordenadasDto;
}