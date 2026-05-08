import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { AppModule } from './presentation/app.module';
import { GlobalErrorFilter } from './presentation/filters/global.filter';
import { AuthErrorFilter } from './presentation/filters/auth.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(cookieParser());
  app.useGlobalFilters(new GlobalErrorFilter(), new AuthErrorFilter());
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  });
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
