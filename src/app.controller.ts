import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
@UseGuards()
@ApiBearerAuth()
export class AppController {
  constructor(private readonly appService: AppService) {}
}