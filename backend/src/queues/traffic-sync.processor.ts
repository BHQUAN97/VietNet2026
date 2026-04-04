import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  PageViewDaily,
} from '../modules/analytics/entities/page-view-daily.entity';

/**
 * Parse user-agent to determine device type.
 */
function detectDevice(
  ua: string | undefined,
): 'mobile' | 'tablet' | 'desktop' {
  if (!ua) return 'desktop';
  const lower = ua.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(lower)) return 'tablet';
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(lower)
  )
    return 'mobile';
  return 'desktop';
}

@Processor('traffic-sync')
export class TrafficSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(TrafficSyncProcessor.name);
  private readonly redisClient: Redis;

  constructor(
    @InjectRepository(PageViewDaily)
    private readonly dailyRepo: Repository<PageViewDaily>,
    private readonly configService: ConfigService,
  ) {
    super();
    this.redisClient = new Redis({
      host: configService.get<string>('redis.host', 'localhost'),
      port: configService.get<number>('redis.port', 6379),
      lazyConnect: true,
    });
    this.redisClient.connect().catch(() => {});
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing traffic sync job ${job.id}`);

    try {
      // Find all traffic counter keys
      const trafficKeys = await this.redisClient.keys('traffic:*');
      if (trafficKeys.length === 0) {
        this.logger.log('No traffic keys to sync');
        return;
      }

      // Collect unique keys and device keys
      const uniqueKeys = await this.redisClient.keys('traffic_unique:*');
      const deviceKeys = await this.redisClient.keys('traffic_device:*');

      // Get all values in one pipeline
      const pipeline = this.redisClient.pipeline();
      for (const key of trafficKeys) {
        pipeline.get(key);
      }
      for (const key of uniqueKeys) {
        pipeline.pfcount(key);
      }
      for (const key of deviceKeys) {
        pipeline.get(key);
      }
      const results = await pipeline.exec();
      if (!results) return;

      const trafficValues = results.slice(0, trafficKeys.length);
      const uniqueValues = results.slice(
        trafficKeys.length,
        trafficKeys.length + uniqueKeys.length,
      );
      const deviceValues = results.slice(
        trafficKeys.length + uniqueKeys.length,
      );

      // Build a map: { "path:date" -> { views, unique, mobile, desktop, tablet } }
      const aggregated = new Map<
        string,
        {
          path: string;
          date: string;
          views: number;
          unique: number;
          mobile: number;
          desktop: number;
          tablet: number;
        }
      >();

      for (let i = 0; i < trafficKeys.length; i++) {
        // Key format: traffic:{path}:{YYYY-MM-DD}
        const parts = trafficKeys[i].split(':');
        const date = parts[parts.length - 1];
        const path = parts.slice(1, -1).join(':');
        const views = parseInt((trafficValues[i]?.[1] as string) || '0', 10);
        const mapKey = `${path}:${date}`;

        aggregated.set(mapKey, {
          path,
          date,
          views,
          unique: 0,
          mobile: 0,
          desktop: 0,
          tablet: 0,
        });
      }

      // Merge unique visitor counts
      for (let i = 0; i < uniqueKeys.length; i++) {
        const parts = uniqueKeys[i].split(':');
        const date = parts[parts.length - 1];
        const path = parts.slice(1, -1).join(':');
        const mapKey = `${path}:${date}`;
        const unique = (uniqueValues[i]?.[1] as number) || 0;

        const existing = aggregated.get(mapKey);
        if (existing) {
          existing.unique = unique;
        }
      }

      // Merge device breakdown counts
      for (let i = 0; i < deviceKeys.length; i++) {
        // Key format: traffic_device:{path}:{YYYY-MM-DD}:{device}
        const parts = deviceKeys[i].split(':');
        const device = parts[parts.length - 1]; // mobile | desktop | tablet
        const date = parts[parts.length - 2];
        const path = parts.slice(1, -2).join(':');
        const mapKey = `${path}:${date}`;
        const count = parseInt((deviceValues[i]?.[1] as string) || '0', 10);

        const existing = aggregated.get(mapKey);
        if (existing && (device === 'mobile' || device === 'desktop' || device === 'tablet')) {
          existing[device] = count;
        }
      }

      // Upsert into page_view_daily table
      let synced = 0;
      for (const entry of aggregated.values()) {
        await this.dailyRepo
          .createQueryBuilder()
          .insert()
          .into(PageViewDaily)
          .values({
            page_path: entry.path,
            view_date: entry.date,
            total_views: entry.views,
            unique_visitors: entry.unique,
            mobile_views: entry.mobile,
            desktop_views: entry.desktop,
            tablet_views: entry.tablet,
          })
          .orUpdate(
            [
              'total_views',
              'unique_visitors',
              'mobile_views',
              'desktop_views',
              'tablet_views',
            ],
            ['page_path', 'view_date'],
          )
          .execute();
        synced++;
      }

      // Clear synced Redis keys (only keys older than today to avoid losing in-progress data)
      const today = new Date().toISOString().split('T')[0];
      const keysToDelete = [
        ...trafficKeys.filter((k) => !k.endsWith(today)),
        ...uniqueKeys.filter((k) => !k.endsWith(today)),
        ...deviceKeys.filter((k) => {
          // device key format: traffic_device:{path}:{date}:{device}
          const parts = k.split(':');
          const date = parts[parts.length - 2];
          return date !== today;
        }),
      ];

      if (keysToDelete.length > 0) {
        await this.redisClient.del(...keysToDelete);
        this.logger.log(`Cleaned ${keysToDelete.length} expired Redis keys`);
      }

      this.logger.log(
        `Traffic sync complete: ${synced} records upserted to page_view_daily`,
      );
    } catch (error) {
      this.logger.error('Traffic sync failed', (error as Error).stack);
      throw error; // Let BullMQ retry
    }
  }
}
