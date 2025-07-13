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

// Define la estructura del objeto anidado 'lectura'
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
  concentracionGas?: number;
}

// Define el payload principal que envía el sensor
export class IngestDataDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  // El campo 'coordenadas' ha sido eliminado de aquí

  @ValidateNested()
  @Type(() => LecturaDto)
  @IsNotEmpty()
  lectura: LecturaDto;
}
