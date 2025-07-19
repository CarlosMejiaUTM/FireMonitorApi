// src/modules/alerts/controllers/alerts.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { AlertsService } from '../services/alerts.service';
import { QueryAlertsDto } from '../dto/query-alerts.dto';

@Controller('alerts')
@UseGuards(AuthGuard('jwt'))
export class AlertsController { 
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(@GetUser() user: User, @Query() filters: QueryAlertsDto) {
    return this.alertsService.findAll(filters, user);
  }
}