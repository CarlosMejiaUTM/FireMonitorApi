import { IsString, IsNotEmpty, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CoordinatesDto } from './coordinates.dto';

export enum NodeType {
  SENSOR = 'sensor',
  REPETIDOR = 'repetidor',
  CENTRAL = 'central',
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