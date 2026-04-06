import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RaportController } from './raport.controller';
import { RaportService } from './raport.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [RaportController],
  providers: [RaportService],
})
export class RaportModule {}
