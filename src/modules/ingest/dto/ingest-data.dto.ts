import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  ValidateNested,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { CoordinatesDto } from 'src/modules/nodes/dto/coordinates.dto'; // <-- Importamos el DTO

// ... (La clase LecturaDto no cambia)
class LecturaDto {
  @IsNumber() temperatura: number;
  @IsNumber() humedad: number;
  @IsBoolean() humoDetectado: boolean;
  @IsBoolean() fuegoDetectado: boolean;
  @IsNumber() @IsOptional() concentracionGas?: number;
}


export class IngestDataDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsNotEmpty()
  coordenadas: CoordinatesDto; // <-- Campo añadido

  @ValidateNested()
  @Type(() => LecturaDto)
  @IsNotEmpty()
  lectura: LecturaDto;
}