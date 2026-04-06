import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}