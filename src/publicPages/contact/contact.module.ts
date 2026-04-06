import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPageContactService } from './contact.service';
import { PublicPageContactController } from './contact.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageContactController], providers: [PublicPageContactService] })
export class PublicPageContactModule { }