import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { UploadModule } from '../../upload/upload.module';

@Module({
  imports: [PrismaModule, CommonModule, UploadModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule { }
