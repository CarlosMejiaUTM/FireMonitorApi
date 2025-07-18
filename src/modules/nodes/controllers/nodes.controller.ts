import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Patch, Delete, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NodesService } from '../services/nodes.service';
import { CreateNodeDto } from '../dto/create-node.dto';
import { UpdateNodeDto } from '../dto/update-node.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User, UserRole } from 'src/modules/users/entities/user.entity';
import { QueryNodesDto } from '../dto/query-nodes.dto';

@Controller('nodes')
@UseGuards(AuthGuard('jwt'))
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Post()
  create(@Body() createNodeDto: CreateNodeDto, @GetUser() user: User) {
    return this.nodesService.create(createNodeDto, user);
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  handleHeartbeat(@Body('nodeId') nodeId: string, @GetUser() user: User) {
    return this.nodesService.handleHeartbeat(nodeId, user);
  }

  @Get()
  findAll(@GetUser() user: User, @Query() queryNodesDto: QueryNodesDto) {
    if (user.role === UserRole.ADMIN) {
      return this.nodesService.findAll(queryNodesDto);
    }
    return this.nodesService.findAllByUserId(user.id, queryNodesDto.tipo);
  }
  
  @Get(':id/history')
  findHistory(@Param('id') id: string, @GetUser() user: User) {
    return this.nodesService.findHistory(id, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.nodesService.findOne(id, user);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNodeDto: UpdateNodeDto, @GetUser() user: User) {
    return this.nodesService.update(id, updateNodeDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.nodesService.remove(id, user);
  }
}