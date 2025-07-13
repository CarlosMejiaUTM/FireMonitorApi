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

export class LecturaDto {
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

export class CoordenadasDto {  // <-- aquí exportar la clase
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class IngestDataDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ValidateNested()
  @Type(() => LecturaDto)
  @IsNotEmpty()
  lectura: LecturaDto;

  @ValidateNested()
  @Type(() => CoordenadasDto)
  @IsNotEmpty()
  coordenadas: CoordenadasDto;
}
