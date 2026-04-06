import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserModule } from '../../actors/users/user.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, UserModule, CommonModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}