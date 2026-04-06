import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CategoryTagController } from './category-tag.controller';
import { CategoryTagService } from './category-tag.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryTagController],
  providers: [CategoryTagService],
})
export class CategoryTagModule {}