import { Module } from '@nestjs/common';
import { AudianceService } from './audiance.service';
import { AudianceController } from './audiance.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AudianceController],
  providers: [AudianceService],
  exports: [AudianceService],
})
export class AudianceModule {}