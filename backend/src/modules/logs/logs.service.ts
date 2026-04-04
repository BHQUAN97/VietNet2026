import { Injectable } from '@nestjs/common';
import { ActionLogger } from '../../common/helpers/logger.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { buildPaginationMeta } from '../../common/helpers/query-builder.helper';
import { AppLog, LogLevel } from './entities/app-log.entity';

@Injectable()
export class LogsService {
  private readonly actionLogger = new ActionLogger('LogsService');

  constructor(
    @InjectRepository(AppLog)
    private readonly logRepo: Repository<AppLog>,
  ) {}

  /** Ghi log vào DB — không throw nếu lỗi (tránh vòng lặp exception) */
  async write(data: Partial<AppLog>): Promise<void> {
    try {
      const log = this.logRepo.create(data);
      await this.logRepo.save(log);
    } catch (err) {
      // Fallback: ghi ra console, không throw để tránh infinite loop
      this.actionLogger.error(`Failed to write log to DB: ${err}`);
    }
  }

  /** Danh sách log có phân trang + lọc theo level */
  async findAll(query: {
    page?: number;
    limit?: number;
    level?: LogLevel;
    search?: string;
  }) {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(Math.max(query.limit || 50, 1), 200);

    const qb = this.logRepo.createQueryBuilder('log');

    if (query.level) {
      qb.andWhere('log.level = :level', { level: query.level });
    }

    if (query.search) {
      qb.andWhere(
        '(log.message LIKE :search OR log.endpoint LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('log.created_at', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, meta: buildPaginationMeta({ page, limit } as any, total) };
  }

  /** Chi tiết 1 log (kèm stack trace đầy đủ) */
  async findOne(id: string): Promise<AppLog | null> {
    return this.logRepo.findOne({ where: { id } });
  }

  /** Thống kê tổng quan */
  async getStats() {
    const [errorCount, warnCount, infoCount, totalToday] = await Promise.all([
      this.logRepo.count({ where: { level: LogLevel.ERROR } }),
      this.logRepo.count({ where: { level: LogLevel.WARN } }),
      this.logRepo.count({ where: { level: LogLevel.INFO } }),
      this.logRepo
        .createQueryBuilder('log')
        .where('DATE(log.created_at) = CURDATE()')
        .getCount(),
    ]);

    return { errorCount, warnCount, infoCount, totalToday };
  }

  /** Xóa log cũ hơn N ngày — gọi từ cron */
  async purgeOlderThan(days: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const result = await this.logRepo.delete({
      created_at: LessThan(cutoff),
    });
    return result.affected || 0;
  }

  /** Xóa nhiều log theo danh sách ID */
  async bulkDelete(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.logRepo
      .createQueryBuilder()
      .delete()
      .whereInIds(ids)
      .execute();
    return result.affected || 0;
  }

  /** Xóa tất cả log (hoặc theo level) */
  async deleteAll(level?: LogLevel): Promise<number> {
    const qb = this.logRepo.createQueryBuilder().delete();
    if (level) {
      qb.where('level = :level', { level });
    }
    const result = await qb.execute();
    return result.affected || 0;
  }
}
