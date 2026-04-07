import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult, Context, Callback } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { DateSerializerInterceptor } from './common/interceptors/date-serializer.interceptor';
import { join } from 'path';

let cachedServer: any;
let cachedApp: any;

const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OSS Events API - Swagger UI</title>
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@4.18.2/favicon-32x32.png" sizes="32x32"/>
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@4.18.2/favicon-16x16.png" sizes="16x16"/>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.18.2/swagger-ui.css"/>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.18.2/swagger-ui-standalone-preset.css"/>
  <style>
    body { background: #0a0a0f; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #c084fc; }
    .swagger-ui .info .description { color: #94a3b8; }
    .swagger-ui .btn.authorize { background-color: #c084fc; border-color: #c084fc; color: white; }
    .swagger-ui .btn.authorize:hover { background-color: #a855f7; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.18.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/docs-json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: 'StandaloneLayout',
        oauth2RedirectUrl: window.location.origin + '/api/oauth2-redirect',
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : [];
  app.enableCors({ origin: allowedOrigins, credentials: true, exposedHeaders: ['Content-Disposition'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.useGlobalInterceptors(new DateSerializerInterceptor());
  app.setGlobalPrefix('api');

  // Swagger JSON endpoint only
  const config = new DocumentBuilder()
    .setTitle('OSS Events API')
    .setDescription('OSS Events API description')
    .setVersion('2.3')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Serve custom HTML from CDN
  app.getHttpAdapter().get('/docs', (req: any, res: any) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(swaggerHtml);
  });

  // Serve Swagger JSON
  app.getHttpAdapter().get('/docs-json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(document);
  });

  await app.init();
  cachedApp = app.getHttpAdapter().getInstance();
  cachedServer = serverlessExpress({ app: cachedApp });
  return { cachedApp, cachedServer };
}

export const handler: any = async (event: any, context: any, callback: any) => {
  if (!cachedApp) { await bootstrap(); }
  if (context && typeof context.end === 'function') {
    return cachedApp(event, context);
  }
  return cachedServer(event, context, callback);
};

export default handler;