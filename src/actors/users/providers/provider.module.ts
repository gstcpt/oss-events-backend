import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { CommonModule } from '../../../common/common.module';
import { UploadModule } from '../../../upload/upload.module';

@Module({
  imports: [PrismaModule, CommonModule, UploadModule],
  controllers: [ProviderController],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule { }
