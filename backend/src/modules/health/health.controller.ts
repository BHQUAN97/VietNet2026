import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ok } from '../../common/helpers/response.helper';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return ok({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}
