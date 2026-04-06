import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPageTermsConditionsService } from './terms-conditions.service';
import { PublicPageTermsConditionsController } from './terms-conditions.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageTermsConditionsController], providers: [PublicPageTermsConditionsService] })
export class PublicPageTermsConditionsModule { }