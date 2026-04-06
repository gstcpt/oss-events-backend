import { Module } from '@nestjs/common';
import { FAQService } from './faq.service';
import { FAQController } from './faq.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LogService } from '../../common/services/log.service';

@Module({
  imports: [PrismaModule],
  controllers: [FAQController],
  providers: [FAQService, LogService],
})
export class FAQModule {}