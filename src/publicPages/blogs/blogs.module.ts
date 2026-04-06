import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { PublicPageBlogsService } from './blogs.service';
import { PublicPageBlogsController } from './blogs.controller';

@Module({ imports: [PrismaModule, CommonModule], controllers: [PublicPageBlogsController], providers: [PublicPageBlogsService] })
export class PublicPageBlogsModule { }