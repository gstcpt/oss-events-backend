import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPageFAQService } from './faq.service';
import { PublicPageFAQController } from './faq.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageFAQController], providers: [PublicPageFAQService] })
export class PublicPageFAQModule { }