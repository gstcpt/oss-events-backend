import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { DateSerializerInterceptor } from './common/interceptors/date-serializer.interceptor';

let cachedServer: any;
let cachedApp: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : [];
  app.enableCors({ origin: allowedOrigins, credentials: true, exposedHeaders: ['Content-Disposition'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.useGlobalInterceptors(new DateSerializerInterceptor());
  app.setGlobalPrefix('api');

  // Swagger
  const config = new DocumentBuilder().setTitle('OSS Events API').setDescription('OSS Events API description').setVersion('2.2').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@4.18.2/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@4.18.2/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@4.18.2/swagger-ui-standalone-preset.js',
    ],
  });

  await app.init();
  cachedApp = app.getHttpAdapter().getInstance();
  cachedServer = serverlessExpress({ app: cachedApp });
  return { cachedApp, cachedServer };
}

export const handler: any = async (event: any, context: any, callback: any) => {
  if (!cachedApp) { await bootstrap(); }
  // Distinguish between Vercel (standard req, res) and AWS Lambda (event, context)
  if (context && typeof context.end === 'function') {
    return cachedApp(event, context);
  }
  return cachedServer(event, context, callback);
};

export default handler;