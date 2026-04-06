import { Module } from '@nestjs/common';
import { PacksService } from './pack.service';
import { PacksController } from './pack.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [PacksController],
  providers: [PacksService],
  exports: [PacksService],
})
export class PackModule {}