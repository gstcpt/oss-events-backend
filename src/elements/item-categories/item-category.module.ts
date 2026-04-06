import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ItemCategoryController } from './item-category.controller';
import { ItemCategoryService } from './item-category.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ItemCategoryController],
  providers: [ItemCategoryService],
})
export class ItemCategoryModule {}