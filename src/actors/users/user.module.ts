import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { ProviderModule } from './providers/provider.module';
import { UploadModule } from '../../upload/upload.module';

@Module({
  imports: [PrismaModule, CommonModule, ProviderModule, UploadModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, ProviderModule],
})
export class UserModule { }