import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { MailService, ConsultationData } from '../common/services/mail.service';
import { InjectRedis } from '../common/decorators/cacheable.decorator';

// Idempotency TTL: giu key trong 24h de tranh send lai khi BullMQ retry
const IDEMPOTENCY_TTL_SEC = 24 * 60 * 60;

@Processor('mail', { concurrency: 5 })
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailService: MailService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(
      `Processing mail job id=${job.id} name=${job.name} attempt=${job.attemptsMade + 1}`,
    );

    // Idempotency key — tranh gui email trung khi BullMQ retry sau khi da gui thanh cong
    const idempotencyKey = `mail:sent:${job.id}`;
    try {
      const alreadySent = await this.redis.get(idempotencyKey);
      if (alreadySent) {
        this.logger.log(`Mail job ${job.id} already sent, skipping duplicate`);
        return;
      }
    } catch {
      // Redis loi -> van gui (fail-open de khong lam mat email)
    }

    try {
      switch (job.name) {
        case 'consultation_confirmation': {
          const { to, name } = job.data as { to: string; name: string };
          await this.mailService.sendConsultationConfirmation(to, name);
          break;
        }

        case 'consultation_notification': {
          const { adminEmail, data } = job.data as {
            adminEmail: string;
            data: ConsultationData;
          };
          await this.mailService.sendConsultationNotification(
            adminEmail,
            data,
          );
          break;
        }

        case 'password_reset': {
          const { to, name, resetUrl } = job.data as {
            to: string;
            name: string;
            resetUrl: string;
          };
          await this.mailService.sendPasswordReset(to, name, resetUrl);
          break;
        }

        case 'welcome': {
          const { to, name } = job.data as { to: string; name: string };
          await this.mailService.sendWelcome(to, name);
          break;
        }

        default:
          this.logger.warn(`Unknown mail job name: ${job.name}`);
          return;
      }

      // Mark idempotency key sau khi gui xong (fire-and-forget, Redis loi khong block)
      try {
        await this.redis.setex(idempotencyKey, IDEMPOTENCY_TTL_SEC, '1');
      } catch {
        // ignore
      }

      this.logger.log(
        `Mail job completed id=${job.id} name=${job.name}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Mail job failed id=${job.id} name=${job.name} attempt=${job.attemptsMade + 1} error=${err?.message}`,
      );
      throw err; // BullMQ will retry based on job options
    }
  }
}
