import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}