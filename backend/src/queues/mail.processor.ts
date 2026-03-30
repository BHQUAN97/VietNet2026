import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService, ConsultationData } from '../common/services/mail.service';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(
      `Processing mail job id=${job.id} name=${job.name} attempt=${job.attemptsMade + 1}`,
    );

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
