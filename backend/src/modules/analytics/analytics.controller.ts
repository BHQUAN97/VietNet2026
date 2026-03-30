import { Controller, Post, Get, Body, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RecordPageviewDto } from './dto/record-pageview.dto';
import {
  AnalyticsSummaryQueryDto,
  AnalyticsPageviewsQueryDto,
  AnalyticsDashboardQueryDto,
} from './dto/analytics-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ok } from '../../common/helpers/response.helper';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * POST /api/analytics/pageview
   * Public endpoint called by frontend to record a page view.
   * Rate-limited to 10 requests per second per IP.
   */
  @Public()
  @Post('pageview')
  @Throttle({ default: { ttl: 1000, limit: 10 } })
  async recordPageView(
    @Body() dto: RecordPageviewDto,
    @Req() req: Request,
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    await this.analyticsService.recordPageViewEnhanced(dto.path, ip, userAgent);

    // Check for page view spike → notify admins
    const isSpike = await this.analyticsService.checkViewSpike(dto.path);
    if (isSpike) {
      this.notificationsService.notifyAdmins(
        'page_view_spike',
        'Luot xem tang dot bien',
        `Trang ${dto.path} dat hon 100 luot xem trong 5 phut`,
        dto.path,
      );
    }

    return ok(null, 'Recorded');
  }

  /**
   * GET /api/analytics/summary?date=YYYY-MM-DD
   * Admin-only endpoint for dashboard stats.
   */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('summary')
  async getSummary(@Query() query: AnalyticsSummaryQueryDto) {
    const targetDate = query.date || new Date().toISOString().split('T')[0];
    const summary = await this.analyticsService.getDailySummary(targetDate);
    return ok(summary);
  }

  /**
   * GET /api/analytics/pageviews?path=/projects&date=YYYY-MM-DD
   * Admin-only endpoint for specific page stats.
   */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('pageviews')
  async getPageViews(@Query() query: AnalyticsPageviewsQueryDto) {
    if (!query.path) {
      return ok({ views: 0, uniqueVisitors: 0 });
    }

    const [views, uniqueVisitors] = await Promise.all([
      this.analyticsService.getPageViews(query.path, query.date),
      this.analyticsService.getUniqueVisitors(query.path, query.date),
    ]);

    return ok({ views, uniqueVisitors });
  }

  /**
   * GET /api/analytics/dashboard?start=YYYY-MM-DD&end=YYYY-MM-DD
   * Admin-only: Full dashboard stats from MySQL (persisted data).
   */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('dashboard')
  async getDashboard(@Query() query: AnalyticsDashboardQueryDto) {
    // Default: last 30 days
    const endDate = query.end || new Date().toISOString().split('T')[0];
    const startDate =
      query.start ||
      new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0];

    const stats = await this.analyticsService.getDashboardStats(
      startDate,
      endDate,
    );
    return ok(stats);
  }
}
