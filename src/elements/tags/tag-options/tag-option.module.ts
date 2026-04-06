import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { TagOptionController } from './tag-option.controller';
import { TagOptionService } from './tag-option.service';

@Module({
  imports: [PrismaModule],
  controllers: [TagOptionController],
  providers: [TagOptionService],
})
export class TagOptionModule {}