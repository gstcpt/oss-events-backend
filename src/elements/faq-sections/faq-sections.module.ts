import { Module } from '@nestjs/common';
import { FaqSectionsService } from './faq-sections.service';
import { FaqSectionsController } from './faq-sections.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { LogService } from '../../common/services/log.service';

@Module({
  controllers: [FaqSectionsController],
  providers: [FaqSectionsService, PrismaService, LogService],
})
export class FaqSectionsModule { }
