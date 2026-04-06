import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPageCreateEventsService } from './createEvents.service';
import { PublicPageCreateEventsController } from './createEvents.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageCreateEventsController], providers: [PublicPageCreateEventsService] })
export class PublicPageCreateEventsModule { }