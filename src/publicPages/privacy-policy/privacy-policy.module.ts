import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPagePrivacyPolicyService } from './privacy-policy.service';
import { PublicPagePrivacyPolicyController } from './privacy-policy.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPagePrivacyPolicyController], providers: [PublicPagePrivacyPolicyService] })
export class PublicPagePrivacyPolicyModule { }