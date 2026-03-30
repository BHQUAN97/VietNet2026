import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { ImageProcessor } from './image.processor';
import { MailProcessor } from './mail.processor';
import { TrafficSyncProcessor } from './traffic-sync.processor';
import { MailService } from '../common/services/mail.service';
import { MailQueueService } from '../common/services/mail-queue.service';
import { EmailLog } from '../modules/analytics/entities/email-log.entity';
import { Media } from '../modules/media/entities/media.entity';
import { PageViewDaily } from '../modules/analytics/entities/page-view-daily.entity';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          maxRetriesPerRequest: null,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'image-processing' },
      { name: 'mail' },
      { name: 'traffic-sync' },
    ),
    TypeOrmModule.forFeature([EmailLog, Media, PageViewDaily]),
  ],
  providers: [
    ImageProcessor,
    MailProcessor,
    TrafficSyncProcessor,
    MailService,
    MailQueueService,
  ],
  exports: [MailQueueService],
})
export class QueuesModule implements OnModuleInit {
  constructor(
    @InjectQueue('traffic-sync') private readonly trafficSyncQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule traffic sync every 10 minutes
    await this.trafficSyncQueue.upsertJobScheduler(
      'traffic-sync-scheduler',
      { every: 10 * 60 * 1000 }, // 10 minutes
      {
        name: 'sync',
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 30_000 },
          removeOnComplete: { age: 24 * 3600 },
          removeOnFail: { age: 7 * 24 * 3600 },
        },
      },
    );
  }
}
