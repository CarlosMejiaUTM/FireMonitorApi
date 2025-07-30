import { IsOptional, IsString, IsEnum } from 'class-validator';
import { NodeType } from './create-node.dto';

export class QueryNodesDto {
  @IsOptional()
  @IsEnum(NodeType)
  tipo?: NodeType;

  @IsOptional()
  @IsString()
  userId?: string;
}
