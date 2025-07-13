// src/modules/ingest/controllers/ingest.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IngestService } from '../services/ingest.service';
import { IngestDataDto } from '../dto/ingest-data.dto';

@Controller('ingest')
export class IngestController {
  constructor(private readonly ingestService: IngestService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestData(@Body() ingestDataDto: IngestDataDto) {
    await this.ingestService.processData(ingestDataDto);
    return { message: 'Datos recibidos y en procesamiento.' };
  }
}
