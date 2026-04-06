import { Module } from '@nestjs/common';
import { PublicPageItemsController } from './items.controller';
import { PublicPageItemsService } from './items.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [PrismaModule, CommonModule],
    controllers: [PublicPageItemsController],
    providers: [PublicPageItemsService],
    exports: [PublicPageItemsService],
})
export class PublicPageItemsModule { }