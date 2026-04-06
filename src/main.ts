import { DateSerializerInterceptor } from './common/interceptors/date-serializer.interceptor';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

(BigInt.prototype as any).toJSON = function () { return this.toString(); };
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
    : [];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }),);
  app.useGlobalInterceptors(new DateSerializerInterceptor());
  app.setGlobalPrefix('api');
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  const httpAdapter = app.get(HttpAdapterHost);
  // Swagger
  const config = new DocumentBuilder().setTitle('OSS Events API').setDescription('OSS Events API description').setVersion('2.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap();