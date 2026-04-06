import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommonModule } from '../../common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogService } from './log.service';
import { LogController } from './log.controller';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService]
})
export class LogModule { }