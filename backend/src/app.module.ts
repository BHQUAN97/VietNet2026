import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

import { databaseConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
import { jwtConfig } from './config/jwt.config';
import { r2Config } from './config/r2.config';
import { mailConfig } from './config/mail.config';

import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ProductsModule } from './modules/products/products.module';
import { MediaModule } from './modules/media/media.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { PagesModule } from './modules/pages/pages.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { RevalidateModule } from './modules/revalidate/revalidate.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QueuesModule } from './queues/queues.module';
import { CronModule } from './modules/cron/cron.module';
import { LogsModule } from './modules/logs/logs.module';
import { ServicesModule } from './common/services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, r2Config, mailConfig],
      envFilePath: ['.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    AuthModule,
    HealthModule,
    UsersModule,
    ProjectsModule,
    ProductsModule,
    MediaModule,
    ConsultationsModule,
    PagesModule,
    AnalyticsModule,
    SettingsModule,
    ArticlesModule,
    RevalidateModule,
    NotificationsModule,
    QueuesModule,
    CronModule,
    LogsModule,
    ServicesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
