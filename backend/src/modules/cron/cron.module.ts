import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CronController } from './cron.controller';
import { CronService } from './cron.service';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { LoginAttempt } from '../auth/entities/login-attempt.entity';
import { PageView } from '../analytics/entities/page-view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, LoginAttempt, PageView]),
    BullModule.registerQueue({ name: 'traffic-sync' }),
  ],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
