import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { EventLineModule } from './event-lines/event-line.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, EventLineModule, CommonModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}