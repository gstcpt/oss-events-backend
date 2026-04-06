import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryTagModule } from './category-tags/category-tag.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CategoryTagModule, CommonModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}