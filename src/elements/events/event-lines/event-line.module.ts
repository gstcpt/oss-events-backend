import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { EventLineController } from './event-line.controller';
import { EventLineService } from './event-line.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventLineController],
  providers: [EventLineService],
})
export class EventLineModule {}