import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [FormsController],
  providers: [FormsService],
})
export class FormsModule {}