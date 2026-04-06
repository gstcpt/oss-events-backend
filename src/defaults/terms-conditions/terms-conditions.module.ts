import { Module } from '@nestjs/common';
import { TermsConditionsService } from './terms-conditions.service';
import { TermsConditionsController } from './terms-conditions.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LogService } from '../../common/services/log.service';

@Module({
  imports: [PrismaModule],
  controllers: [TermsConditionsController],
  providers: [TermsConditionsService, LogService],
})
export class TermsConditionsModule {}