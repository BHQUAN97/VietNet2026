import { Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CronGuard } from '../../common/guards/cron.guard';
import { CronService } from './cron.service';
import { ok } from '../../common/helpers/response.helper';

@Controller('cron')
@Public() // Bypass JWT — xác thực qua CronGuard bằng x-cron-secret header
@UseGuards(CronGuard)
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Post('traffic-sync')
  async trafficSync() {
    const result = await this.cronService.triggerTrafficSync();
    return ok(result, 'Traffic sync job queued');
  }

  @Post('cleanup-sessions')
  async cleanupSessions() {
    const result = await this.cronService.cleanupSessions();
    return ok(result, 'Cleanup sessions complete');
  }

  @Post('cleanup-orphan-media')
  async cleanupOrphanMedia() {
    const result = await this.cronService.cleanupOrphanMedia();
    return ok(result, 'Orphan media cleanup complete');
  }

  @Post('publish-scheduled')
  async publishScheduled() {
    const result = await this.cronService.publishScheduled();
    return ok(result, 'Publish scheduled entities complete');
  }
}
