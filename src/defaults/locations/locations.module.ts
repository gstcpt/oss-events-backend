import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LocationController } from './locations.controller';
import { LocationService } from './locations.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
