import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPageHomeService } from './home.service';
import { PublicPageHomeController } from './home.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageHomeController], providers: [PublicPageHomeService] })
export class PublicPageHomeModule { }
