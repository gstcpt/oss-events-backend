import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ItemOccupationController } from './item-occupation.controller';
import { ItemOccupationService } from './item-occupation.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ItemOccupationController],
  providers: [ItemOccupationService],
})
export class ItemOccupationModule {}