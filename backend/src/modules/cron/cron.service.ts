import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { LoginAttempt } from '../auth/entities/login-attempt.entity';
import { PageView } from '../analytics/entities/page-view.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectQueue('traffic-sync') private readonly trafficSyncQueue: Queue,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepo: Repository<LoginAttempt>,
    @InjectRepository(PageView)
    private readonly pageViewRepo: Repository<PageView>,
  ) {}

  /**
   * Trigger traffic sync — thêm job vào BullMQ queue để processor xử lý.
   * Tận dụng TrafficSyncProcessor đã có sẵn.
   */
  async triggerTrafficSync() {
    const job = await this.trafficSyncQueue.add('sync', {}, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: { age: 24 * 3600 },
      removeOnFail: { age: 7 * 24 * 3600 },
    });

    this.logger.log(`Traffic sync job queued: ${job.id}`);
    return { jobId: job.id };
  }

  /**
   * Cleanup expired sessions:
   * - Xóa refresh tokens đã hết hạn hoặc đã revoke > 7 ngày
   * - Xóa login attempts > 30 ngày
   * - Xóa raw page_views > 90 ngày (đã aggregate vào page_view_daily)
   */
  async cleanupSessions() {
    const now = new Date();

    // Xóa refresh tokens hết hạn
    const expiredTokens = await this.refreshTokenRepo.delete({
      expires_at: LessThan(now),
    });

    // Xóa refresh tokens đã revoke > 7 ngày
    const revokedCutoff = new Date(now.getTime() - 7 * 86_400_000);
    const revokedTokens = await this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .where('revoked_at IS NOT NULL')
      .andWhere('revoked_at < :cutoff', { cutoff: revokedCutoff })
      .execute();

    // Xóa login attempts > 30 ngày
    const loginCutoff = new Date(now.getTime() - 30 * 86_400_000);
    const oldAttempts = await this.loginAttemptRepo.delete({
      attempted_at: LessThan(loginCutoff),
    });

    // Xóa raw page_views > 90 ngày (đã sync vào page_view_daily)
    const viewsCutoff = new Date(now.getTime() - 90 * 86_400_000);
    const oldViews = await this.pageViewRepo.delete({
      viewed_at: LessThan(viewsCutoff),
    });

    const result = {
      expiredTokens: expiredTokens.affected ?? 0,
      revokedTokens: revokedTokens.affected ?? 0,
      oldLoginAttempts: oldAttempts.affected ?? 0,
      oldPageViews: oldViews.affected ?? 0,
    };

    this.logger.log('Cleanup sessions complete', result);
    return result;
  }
}
