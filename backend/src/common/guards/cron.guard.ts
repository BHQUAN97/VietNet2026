import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';

/**
 * Guard xác thực cron requests qua header x-cron-secret.
 * Reject nếu CRON_SECRET chưa cấu hình hoặc không khớp.
 */
@Injectable()
export class CronGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const secret = this.normalizeSecret(
      process.env.CRON_SECRET ?? this.configService.get<string>('CRON_SECRET'),
    );
    const provided = this.normalizeSecret(request.headers['x-cron-secret']);
    const providedHash = this.normalizeSecret(
      request.headers['x-cron-secret-sha256'],
    );

    if (
      !secret ||
      (!this.matchesSecret(provided, secret) &&
        !this.matchesSecretHash(providedHash, secret))
    ) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    return true;
  }

  private normalizeSecret(value: unknown): string | undefined {
    const raw = Array.isArray(value) ? value[0] : value;
    return typeof raw === 'string' ? raw.replace(/[\r\n]/g, '').trim() : undefined;
  }

  private matchesSecret(provided: string | undefined, secret: string): boolean {
    return this.safeEqual(provided, secret);
  }

  private matchesSecretHash(providedHash: string | undefined, secret: string): boolean {
    const expectedHash = createHash('sha256').update(secret).digest('hex');
    return this.safeEqual(providedHash, expectedHash);
  }

  private safeEqual(a: string | undefined, b: string): boolean {
    if (!a || a.length !== b.length) {
      return false;
    }

    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
