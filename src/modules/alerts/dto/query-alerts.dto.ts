import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAlertsDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  desde?: string;

  @IsOptional()
  @IsString()
  hasta?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) 
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number) 
  limit?: number;
}