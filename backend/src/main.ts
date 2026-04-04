import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { validateEnv } from './config/env.validation';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { LogsService } from './modules/logs/logs.service';

async function bootstrap() {
  validateEnv();

  // Tắt body parser mặc định của NestJS để tránh "request entity too large"
  // khi content chứa base64 images vượt default limit
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  // Redis adapter cho Socket.io (pub/sub across cluster)
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisIoAdapter = new RedisIoAdapter(app, redisHost, redisPort);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.setGlobalPrefix('api');

  // Body parser limit — 20MB cho content chứa base64 images
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Serve local uploads khi R2 chưa config
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        styleSrcElem: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'blob:', '*.r2.cloudflarestorage.com', '*.r2.dev', 'bhquan.site', 'bhquan.store'],
        mediaSrc: ["'self'", 'data:', 'blob:', '*.r2.dev', '*.r2.cloudflarestorage.com'],
        connectSrc: ["'self'", 'wss:', 'ws:', '*.r2.dev'],
        fontSrc: ["'self'", 'fonts.gstatic.com', 'fonts.googleapis.com', 'data:'],
        frameSrc: ["'none'"],
      },
    },
  }));
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // GlobalExceptionFilter cần LogsService qua DI
  const logsService = app.get(LogsService);
  app.useGlobalFilters(new GlobalExceptionFilter(logsService));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
