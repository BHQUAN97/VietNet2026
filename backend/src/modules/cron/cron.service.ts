import { Injectable } from '@nestjs/common';
import { ActionLogger } from '../../common/helpers/logger.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { LoginAttempt } from '../auth/entities/login-attempt.entity';
import { PageView } from '../analytics/entities/page-view.entity';
import { Media } from '../media/entities/media.entity';
import { Article, ArticleStatus } from '../articles/entities/article.entity';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { R2StorageService } from '../../common/services/r2-storage.service';
import { InjectRedis } from '../../common/decorators/cacheable.decorator';

// Giu media soft-deleted 30 ngay truoc khi hard-delete ra R2
const MEDIA_SOFT_DELETE_RETENTION_DAYS = 30;

@Injectable()
export class CronService {
  private readonly actionLogger = new ActionLogger('CronService');

  constructor(
    @InjectQueue('traffic-sync') private readonly trafficSyncQueue: Queue,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepo: Repository<LoginAttempt>,
    @InjectRepository(PageView)
    private readonly pageViewRepo: Repository<PageView>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRedis() private readonly redisClient: Redis,
    private readonly r2Storage: R2StorageService,
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

    this.actionLogger.log(`Traffic sync job queued: ${job.id}`);
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

    this.actionLogger.log('Cleanup sessions complete');
    return result;
  }

  /**
   * Cleanup orphan media files:
   * - Tim Media soft-deleted > 30 ngay (da qua retention window)
   * - Xoa file tren R2 roi hard-delete row khoi DB
   * Chay tuan/thang, tranh de orphan tich tu trong R2 bucket.
   */
  async cleanupOrphanMedia() {
    const cutoff = new Date(
      Date.now() - MEDIA_SOFT_DELETE_RETENTION_DAYS * 86_400_000,
    );

    // Tim cac media da soft-delete qua 30 ngay (safe window de admin co the restore)
    const orphans = await this.mediaRepo.find({
      where: {
        deleted_at: LessThan(cutoff),
      },
      take: 500, // Gioi han moi batch de tranh OOM
    });

    let deletedFromR2 = 0;
    let failedR2Deletes = 0;
    const deletedIds: string[] = [];

    for (const media of orphans) {
      // Xoa cac object R2: original (private) + thumbnail/preview (public)
      const r2Deletes: Promise<void>[] = [];

      // Tu original_url suy ra R2 key: dinh dang media/{id}/{filename}
      const originalKey = this.extractR2KeyFromUrl(media.original_url);
      if (originalKey) {
        r2Deletes.push(
          this.r2Storage
            .delete('private', originalKey)
            .then(() => {
              deletedFromR2 += 1;
            })
            .catch((err) => {
              failedR2Deletes += 1;
              this.actionLogger.warn(
                `R2 delete failed key=${originalKey}: ${err?.message ?? err}`,
              );
            }),
        );
      }

      if (media.thumbnail_url) {
        r2Deletes.push(
          this.r2Storage
            .delete('public', `media/${media.id}/thumb.webp`)
            .then(() => {
              deletedFromR2 += 1;
            })
            .catch((err) => {
              failedR2Deletes += 1;
              this.actionLogger.warn(
                `R2 delete thumb failed id=${media.id}: ${err?.message ?? err}`,
              );
            }),
        );
      }

      if (media.preview_url) {
        r2Deletes.push(
          this.r2Storage
            .delete('public', `media/${media.id}/preview.webp`)
            .then(() => {
              deletedFromR2 += 1;
            })
            .catch((err) => {
              failedR2Deletes += 1;
              this.actionLogger.warn(
                `R2 delete preview failed id=${media.id}: ${err?.message ?? err}`,
              );
            }),
        );
      }

      await Promise.allSettled(r2Deletes);
      deletedIds.push(media.id);
    }

    // Hard-delete DB rows sau khi da co gang xoa R2
    if (deletedIds.length > 0) {
      await this.mediaRepo
        .createQueryBuilder()
        .delete()
        .whereInIds(deletedIds)
        .execute();
    }

    const result = {
      examined: orphans.length,
      dbDeleted: deletedIds.length,
      r2Deleted: deletedFromR2,
      r2Failed: failedR2Deletes,
    };

    this.actionLogger.log(
      `Orphan media cleanup: ${JSON.stringify(result)}`,
    );
    return result;
  }

  /** Parse R2 key tu url — handle cac format r2.dev va r2.cloudflarestorage.com */
  private extractR2KeyFromUrl(url: string | null): string | null {
    if (!url) return null;
    // Pattern: https://{host}/{bucket}/{key} hoac https://pub-{id}.r2.dev/{key}
    const match = url.match(/\/\/[^/]+\/(?:[^/]+\/)?(.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Auto-publish draft entities co scheduled_publish_at <= NOW():
   * - articles / projects / products: UPDATE status='published', published_at=NOW(),
   *   scheduled_publish_at=NULL WHERE status='draft' AND deleted_at IS NULL.
   * - Sau khi UPDATE, invalidate Redis cache (@Cacheable bypass) — try/catch
   *   de loi Redis khong lam fail cron.
   * Tra ve so row affected moi loai de caller co the log/monitor.
   */
  async publishScheduled(): Promise<{
    articles: number;
    projects: number;
    products: number;
  }> {
    const now = new Date();

    // Articles
    const articlesRes = await this.articleRepo
      .createQueryBuilder()
      .update(Article)
      .set({
        status: ArticleStatus.PUBLISHED,
        published_at: () => 'NOW()',
        scheduled_publish_at: null,
      })
      .where('status = :status', { status: ArticleStatus.DRAFT })
      .andWhere('scheduled_publish_at IS NOT NULL')
      .andWhere('scheduled_publish_at <= :now', { now })
      .andWhere('deleted_at IS NULL')
      .execute();
    const articles = articlesRes.affected ?? 0;

    // Projects
    const projectsRes = await this.projectRepo
      .createQueryBuilder()
      .update(Project)
      .set({
        status: ProjectStatus.PUBLISHED,
        published_at: () => 'NOW()',
        scheduled_publish_at: null,
      })
      .where('status = :status', { status: ProjectStatus.DRAFT })
      .andWhere('scheduled_publish_at IS NOT NULL')
      .andWhere('scheduled_publish_at <= :now', { now })
      .andWhere('deleted_at IS NULL')
      .execute();
    const projects = projectsRes.affected ?? 0;

    // Products
    const productsRes = await this.productRepo
      .createQueryBuilder()
      .update(Product)
      .set({
        status: ProductStatus.PUBLISHED,
        published_at: () => 'NOW()',
        scheduled_publish_at: null,
      })
      .where('status = :status', { status: ProductStatus.DRAFT })
      .andWhere('scheduled_publish_at IS NOT NULL')
      .andWhere('scheduled_publish_at <= :now', { now })
      .andWhere('deleted_at IS NULL')
      .execute();
    const products = productsRes.affected ?? 0;

    // Invalidate cache cho moi loai co affected rows — bypass service .publish() nen phai tu xoa.
    // Redis failure khong duoc fail cron.
    await Promise.all([
      articles > 0 ? this.evictCachePattern('article:*') : Promise.resolve(),
      projects > 0 ? this.evictCachePattern('project:*') : Promise.resolve(),
      products > 0 ? this.evictCachePattern('product:*') : Promise.resolve(),
    ]);

    const result = { articles, projects, products };
    this.actionLogger.log(
      `Publish scheduled complete: ${JSON.stringify(result)}`,
    );
    return result;
  }

  /** Xoa tat ca key match pattern tren Redis. Fail-safe: swallow moi loi. */
  private async evictCachePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (err) {
      this.actionLogger.warn(
        `Redis evict failed pattern=${pattern}: ${(err as Error)?.message ?? err}`,
      );
    }
  }
}
