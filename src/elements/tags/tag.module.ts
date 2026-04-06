import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TagOptionModule } from './tag-options/tag-option.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, TagOptionModule, CommonModule],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}