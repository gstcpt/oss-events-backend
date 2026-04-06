import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPageProvidersService } from './providers.service';
import { PublicPageProvidersController } from './providers.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageProvidersController], providers: [PublicPageProvidersService] })
export class PublicPageProvidersModule { }