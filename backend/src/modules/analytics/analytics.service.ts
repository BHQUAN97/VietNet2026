import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PageViewDaily } from './entities/page-view-daily.entity';

/** Known bot patterns in user-agent strings */
const BOT_PATTERNS = [
  'bot',
  'crawl',
  'spider',
  'slurp',
  'lighthouse',
  'pagespeed',
  'headless',
  'phantom',
  'wget',
  'curl',
];

@Injectable()
export class AnalyticsService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor(
    @InjectRepository(PageViewDaily)
    private readonly dailyRepo: Repository<PageViewDaily>,
    private readonly configService: ConfigService,
  ) {
    this.redisClient = new Redis({
      host: configService.get<string>('redis.host', 'localhost'),
      port: configService.get<number>('redis.port', 6379),
      lazyConnect: true,
    });
    this.redisClient.connect().catch(() => {
      // Connection errors handled by ioredis retry
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  /**
   * Detect if user-agent belongs to a bot/crawler.
   */
  isBot(userAgent: string | undefined): boolean {
    if (!userAgent) return true;
    const ua = userAgent.toLowerCase();
    return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
  }

  /**
   * Record a page view in Redis. Increments daily counter per path.
   * Key format: traffic:{pagePath}:{YYYY-MM-DD}
   * TTL: 2 days (data synced to MySQL by TRAFFIC_SYNC_JOB worker before expiry).
   */
  async recordPageView(
    pagePath: string,
    ip: string | undefined,
    userAgent: string | undefined,
  ): Promise<void> {
    if (this.isBot(userAgent)) {
      return;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `traffic:${pagePath}:${today}`;

    const pipeline = this.redisClient.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, 86400 * 2); // 2-day TTL

    // Track unique visitors via HyperLogLog
    if (ip) {
      const uniqueKey = `traffic_unique:${pagePath}:${today}`;
      pipeline.pfadd(uniqueKey, ip);
      pipeline.expire(uniqueKey, 86400 * 2);
    }

    await pipeline.exec();
  }

  /**
   * Get total view count for a specific page and date.
   */
  async getPageViews(pagePath: string, date?: string): Promise<number> {
    const day = date || new Date().toISOString().split('T')[0];
    const key = `traffic:${pagePath}:${day}`;
    const count = await this.redisClient.get(key);
    return parseInt(count || '0', 10);
  }

  /**
   * Get unique visitor count for a specific page and date (via HyperLogLog).
   */
  async getUniqueVisitors(pagePath: string, date?: string): Promise<number> {
    const day = date || new Date().toISOString().split('T')[0];
    const key = `traffic_unique:${pagePath}:${day}`;
    return this.redisClient.pfcount(key);
  }

  /**
   * Get summary stats for admin dashboard. Requires date param.
   */
  async getDailySummary(date: string): Promise<{
    totalViews: number;
    topPages: Array<{ path: string; views: number }>;
  }> {
    const pattern = `traffic:*:${date}`;
    const keys = await this.redisClient.keys(pattern);

    const results: Array<{ path: string; views: number }> = [];
    let totalViews = 0;

    if (keys.length > 0) {
      const values = await this.redisClient.mget(...keys);
      for (let i = 0; i < keys.length; i++) {
        // Key format: traffic:{path}:{date}
        const parts = keys[i].split(':');
        // Remove 'traffic' prefix and date suffix, rejoin middle parts
        const path = parts.slice(1, -1).join(':');
        const views = parseInt(values[i] || '0', 10);
        totalViews += views;
        results.push({ path, views });
      }
    }

    // Sort by views descending, take top 20
    results.sort((a, b) => b.views - a.views);
    const topPages = results.slice(0, 20);

    return { totalViews, topPages };
  }

  /**
   * Get analytics dashboard data from MySQL (persisted data).
   * Supports date range queries for charts and aggregations.
   */
  async getDashboardStats(startDate: string, endDate: string): Promise<{
    totalViews: number;
    totalUnique: number;
    deviceBreakdown: { mobile: number; desktop: number; tablet: number };
    dailyTrend: Array<{ date: string; views: number; unique: number }>;
    topPages: Array<{
      path: string;
      views: number;
      unique: number;
    }>;
  }> {
    // Aggregate totals for the date range
    const totals = await this.dailyRepo
      .createQueryBuilder('d')
      .select('SUM(d.total_views)', 'totalViews')
      .addSelect('SUM(d.unique_visitors)', 'totalUnique')
      .addSelect('SUM(d.mobile_views)', 'mobileViews')
      .addSelect('SUM(d.desktop_views)', 'desktopViews')
      .addSelect('SUM(d.tablet_views)', 'tabletViews')
      .where('d.view_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    // Daily trend for charts
    const dailyTrend = await this.dailyRepo
      .createQueryBuilder('d')
      .select('d.view_date', 'date')
      .addSelect('SUM(d.total_views)', 'views')
      .addSelect('SUM(d.unique_visitors)', 'unique')
      .where('d.view_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('d.view_date')
      .orderBy('d.view_date', 'ASC')
      .getRawMany();

    // Top pages by total views
    const topPages = await this.dailyRepo
      .createQueryBuilder('d')
      .select('d.page_path', 'path')
      .addSelect('SUM(d.total_views)', 'views')
      .addSelect('SUM(d.unique_visitors)', 'unique')
      .where('d.view_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('d.page_path')
      .orderBy('views', 'DESC')
      .limit(20)
      .getRawMany();

    return {
      totalViews: parseInt(totals?.totalViews || '0', 10),
      totalUnique: parseInt(totals?.totalUnique || '0', 10),
      deviceBreakdown: {
        mobile: parseInt(totals?.mobileViews || '0', 10),
        desktop: parseInt(totals?.desktopViews || '0', 10),
        tablet: parseInt(totals?.tabletViews || '0', 10),
      },
      dailyTrend: dailyTrend.map((row: any) => ({
        date: row.date,
        views: parseInt(row.views || '0', 10),
        unique: parseInt(row.unique || '0', 10),
      })),
      topPages: topPages.map((row: any) => ({
        path: row.path,
        views: parseInt(row.views || '0', 10),
        unique: parseInt(row.unique || '0', 10),
      })),
    };
  }

  /**
   * Record page view with device type detection for enhanced Redis tracking.
   */
  detectDevice(userAgent: string | undefined): 'mobile' | 'tablet' | 'desktop' {
    if (!userAgent) return 'desktop';
    const ua = userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua))
      return 'mobile';
    return 'desktop';
  }

  /**
   * Enhanced page view recording with device type tracking.
   */
  async recordPageViewEnhanced(
    pagePath: string,
    ip: string | undefined,
    userAgent: string | undefined,
  ): Promise<void> {
    if (this.isBot(userAgent)) return;

    const today = new Date().toISOString().split('T')[0];
    const device = this.detectDevice(userAgent);
    const key = `traffic:${pagePath}:${today}`;

    const pipeline = this.redisClient.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, 86400 * 2);

    // Track device type
    const deviceKey = `traffic_device:${pagePath}:${today}:${device}`;
    pipeline.incr(deviceKey);
    pipeline.expire(deviceKey, 86400 * 2);

    // Track unique visitors via HyperLogLog
    if (ip) {
      const uniqueKey = `traffic_unique:${pagePath}:${today}`;
      pipeline.pfadd(uniqueKey, ip);
      pipeline.expire(uniqueKey, 86400 * 2);
    }

    await pipeline.exec();
  }

  /**
   * Check for page view spike: >100 views in 5 minutes on a single page.
   */
  async checkViewSpike(pagePath: string): Promise<boolean> {
    const spikeKey = `spike:${pagePath}`;
    const pipeline = this.redisClient.pipeline();
    pipeline.incr(spikeKey);
    pipeline.expire(spikeKey, 300); // 5-minute window
    const results = await pipeline.exec();
    const count = (results?.[0]?.[1] as number) || 0;
    return count >= 100;
  }
}
