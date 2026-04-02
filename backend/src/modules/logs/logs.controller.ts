import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogLevel } from './entities/app-log.entity';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { ok, paginated } from '../../common/helpers/response.helper';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';

@Controller('logs')
@AdminOnly()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /**
   * GET /api/logs
   * Lấy danh sách log có phân trang, lọc level, tìm kiếm
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('level') level?: LogLevel,
    @Query('search') search?: string,
  ) {
    const result = await this.logsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      level,
      search,
    });

    return paginated(result.data, result.meta);
  }

  /**
   * GET /api/logs/stats
   * Thống kê tổng quan: error/warn/info count, total today
   */
  @Get('stats')
  async getStats() {
    const stats = await this.logsService.getStats();
    return ok(stats);
  }

  /**
   * GET /api/logs/:id
   * Chi tiết 1 log — xem stack trace đầy đủ
   */
  @Get(':id')
  async findOne(@Param('id', ParseUlidPipe) id: string) {
    const log = await this.logsService.findOne(id);
    if (!log) {
      throw new NotFoundException('Log không tồn tại');
    }
    return ok(log);
  }
}
