import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ItemMediaController } from './item-media.controller';
import { ItemMediaService } from './item-media.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ItemMediaController],
  providers: [ItemMediaService],
})
export class ItemMediaModule {}