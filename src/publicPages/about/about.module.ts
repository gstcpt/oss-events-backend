import { Module } from '@nestjs/common';
import { PublicPageAboutService } from './about.service';
import { PublicPageAboutController } from './about.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageAboutController], providers: [PublicPageAboutService] })
export class PublicPageAboutModule { }