import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard xác thực cron requests qua header x-cron-secret.
 * Reject nếu CRON_SECRET chưa cấu hình hoặc không khớp.
 */
@Injectable()
export class CronGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const secret = this.configService.get<string>('CRON_SECRET')?.trim();
    const provided = (request.headers['x-cron-secret'] as string)?.trim();

    if (!secret || provided !== secret) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    return true;
  }
}
