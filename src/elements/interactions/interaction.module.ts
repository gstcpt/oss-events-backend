import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [InteractionController],
  providers: [InteractionService],
})
export class InteractionModule {}