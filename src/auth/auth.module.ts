import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { UserModule } from '../actors/users/user.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    CommonModule,
    PrismaModule,
    UserModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'secretKey',
        signOptions: { expiresIn: '60m' }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    OptionalJwtAuthGuard
  ],
  exports: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard]
})
export class AuthModule { }