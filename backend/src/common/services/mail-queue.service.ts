import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConsultationData } from './mail.service';

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 60_000, // 1 minute base delay
  },
  removeOnComplete: { age: 7 * 24 * 3600 }, // keep 7 days
  removeOnFail: { age: 30 * 24 * 3600 }, // keep 30 days
};

@Injectable()
export class MailQueueService {
  private readonly logger = new Logger(MailQueueService.name);

  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

  async queueConsultationConfirmation(
    to: string,
    name: string,
  ): Promise<void> {
    const job = await this.mailQueue.add(
      'consultation_confirmation',
      { to, name },
      DEFAULT_JOB_OPTIONS,
    );
    this.logger.log(
      `Queued consultation_confirmation jobId=${job.id} to=${to}`,
    );
  }

  async queueConsultationNotification(
    adminEmail: string,
    data: ConsultationData,
  ): Promise<void> {
    const job = await this.mailQueue.add(
      'consultation_notification',
      { adminEmail, data },
      DEFAULT_JOB_OPTIONS,
    );
    this.logger.log(
      `Queued consultation_notification jobId=${job.id} to=${adminEmail}`,
    );
  }

  async queuePasswordReset(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    const job = await this.mailQueue.add(
      'password_reset',
      { to, name, resetUrl },
      DEFAULT_JOB_OPTIONS,
    );
    this.logger.log(`Queued password_reset jobId=${job.id} to=${to}`);
  }

  async queueWelcome(to: string, name: string): Promise<void> {
    const job = await this.mailQueue.add(
      'welcome',
      { to, name },
      DEFAULT_JOB_OPTIONS,
    );
    this.logger.log(`Queued welcome jobId=${job.id} to=${to}`);
  }
}
