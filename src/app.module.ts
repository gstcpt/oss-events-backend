import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DefaultsModule } from './defaults/defaults.module';
import { ActorsModule } from './actors/actors.module';
import { ElementsModule } from './elements/elements.module';
import { UploadModule } from './upload/upload.module';
import { PublicPageModule } from './publicPages/publicPages.module';
import { CommonModule } from './common/common.module';
import { CommonControllersModule } from './common/controllers.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformerInterceptor } from './common/interceptors/response-transformer.interceptor';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    CommonModule,
    CommonControllersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DefaultsModule,
    ActorsModule,
    ElementsModule,
    UploadModule,
    PublicPageModule
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: AllExceptionsFilter }, { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }, { provide: APP_INTERCEPTOR, useClass: ResponseTransformerInterceptor }],
})
export class AppModule { }