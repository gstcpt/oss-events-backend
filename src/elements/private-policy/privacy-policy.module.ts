import { Module } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LogService } from '../../common/services/log.service';

@Module({
  imports: [PrismaModule],
  controllers: [PrivacyPolicyController],
  providers: [PrivacyPolicyService, LogService],
})
export class PrivacyPolicyModule {}