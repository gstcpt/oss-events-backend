import { Module } from '@nestjs/common';
import { PackLineService } from './pack-line.service';
import { PackLineController } from './pack-line.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PackLineController],
  providers: [PackLineService],
  exports: [PackLineService],
})
export class PackLineModule {}