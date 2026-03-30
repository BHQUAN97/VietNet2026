import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resend } from 'resend';
import {
  EmailLog,
  EmailLogStatus,
} from '../../modules/analytics/entities/email-log.entity';

export interface ConsultationData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
  ) {
    const apiKey = this.configService.get<string>('mail.apiKey');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY is not set — emails will not be sent',
      );
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }
    this.from =
      this.configService.get<string>('mail.from') ||
      'VietNet Interior <noreply@bhquan.site>';
  }

  // ------------------------------------------------------------------ //
  //  Public methods — called by MailProcessor only                      //
  // ------------------------------------------------------------------ //

  async sendConsultationConfirmation(
    to: string,
    name: string,
  ): Promise<EmailLog> {
    const subject = 'Xác nhận yêu cầu tư vấn – VietNet Interior';
    const html = this.buildConsultationConfirmationHtml(name);
    return this.send('consultation_confirmation', to, subject, html);
  }

  async sendConsultationNotification(
    adminEmail: string,
    consultation: ConsultationData,
  ): Promise<EmailLog> {
    const subject = `[Tư vấn mới] ${consultation.name} – ${consultation.email}`;
    const html = this.buildConsultationNotificationHtml(consultation);
    return this.send('consultation_notification', adminEmail, subject, html);
  }

  async sendPasswordReset(
    to: string,
    name: string,
    resetUrl: string,
  ): Promise<EmailLog> {
    const subject = 'Đặt lại mật khẩu – VietNet Interior';
    const html = this.buildPasswordResetHtml(name, resetUrl);
    return this.send('password_reset', to, subject, html);
  }

  async sendWelcome(to: string, name: string): Promise<EmailLog> {
    const subject = 'Chào mừng bạn đến với VietNet Interior';
    const html = this.buildWelcomeHtml(name);
    return this.send('welcome', to, subject, html);
  }

  // ------------------------------------------------------------------ //
  //  Update log status (called by processor after send attempt)         //
  // ------------------------------------------------------------------ //

  async markSent(logId: string): Promise<void> {
    await this.emailLogRepo.update(logId, {
      status: EmailLogStatus.SENT,
      sent_at: new Date(),
    });
  }

  async markFailed(
    logId: string,
    errorMessage: string,
    retryCount: number,
  ): Promise<void> {
    await this.emailLogRepo.update(logId, {
      status: EmailLogStatus.FAILED,
      error_message: errorMessage,
      retry_count: retryCount,
    });
  }

  // ------------------------------------------------------------------ //
  //  Core send logic                                                    //
  // ------------------------------------------------------------------ //

  /**
   * Basic email format validation.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
  }

  private async send(
    type: string,
    to: string,
    subject: string,
    html: string,
  ): Promise<EmailLog> {
    // Guard: validate email format before sending
    if (!this.isValidEmail(to)) {
      this.logger.warn(`Invalid email address: ${to}, skipping send`);
      throw new Error(`Invalid email address: ${to}`);
    }

    // 1. Create log entry (status = QUEUED)
    const log = this.emailLogRepo.create({
      type,
      to_email: to,
      subject,
      status: EmailLogStatus.QUEUED,
    });
    await this.emailLogRepo.save(log);

    // 2. Send via Resend
    if (!this.resend) {
      this.logger.warn(`Mail skipped (no API key): type=${type} to=${to}`);
      log.status = EmailLogStatus.FAILED;
      log.error_message = 'RESEND_API_KEY not configured';
      await this.emailLogRepo.save(log);
      return log;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: [to],
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }

      // 3. Mark sent
      log.status = EmailLogStatus.SENT;
      log.sent_at = new Date();
      await this.emailLogRepo.save(log);

      this.logger.log(`Email sent: type=${type} to=${to} logId=${log.id}`);
    } catch (err: any) {
      log.status = EmailLogStatus.FAILED;
      log.error_message = err?.message || 'Unknown error';
      await this.emailLogRepo.save(log);

      this.logger.error(
        `Email send failed: type=${type} to=${to} logId=${log.id} error=${err?.message}`,
      );
      throw err; // re-throw so BullMQ can retry
    }

    return log;
  }

  // ------------------------------------------------------------------ //
  //  Email templates (simple HTML)                                      //
  // ------------------------------------------------------------------ //

  private wrapLayout(content: string): string {
    return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FCF9F7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td style="text-align:center;padding-bottom:32px;">
        <h1 style="color:#553722;font-size:24px;margin:0;">VietNet Interior</h1>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;border-radius:8px;padding:32px;color:#1B1C1B;font-size:15px;line-height:1.6;">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="text-align:center;padding-top:24px;font-size:12px;color:#888;">
        &copy; ${new Date().getFullYear()} VietNet Interior &mdash; bhquan.site
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildConsultationConfirmationHtml(name: string): string {
    return this.wrapLayout(`
      <h2 style="color:#553722;margin:0 0 16px;">Xin chào ${this.escapeHtml(name)},</h2>
      <p>Cảm ơn bạn đã gửi yêu cầu tư vấn thiết kế nội thất đến <strong>VietNet Interior</strong>.</p>
      <p>Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ lại trong vòng <strong>24 giờ</strong> làm việc.</p>
      <p>Nếu bạn cần hỗ trợ gấp, vui lòng liên hệ hotline: <strong>0xxx.xxx.xxx</strong></p>
      <p style="margin-top:24px;">Trân trọng,<br><strong>Đội ngũ VietNet Interior</strong></p>
    `);
  }

  private buildConsultationNotificationHtml(
    consultation: ConsultationData,
  ): string {
    return this.wrapLayout(`
      <h2 style="color:#553722;margin:0 0 16px;">Yêu cầu tư vấn mới</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:8px 0;font-weight:bold;width:120px;">Họ tên:</td>
          <td style="padding:8px 0;">${this.escapeHtml(consultation.name)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:bold;">Email:</td>
          <td style="padding:8px 0;">${this.escapeHtml(consultation.email)}</td>
        </tr>
        ${consultation.phone ? `<tr><td style="padding:8px 0;font-weight:bold;">Điện thoại:</td><td style="padding:8px 0;">${this.escapeHtml(consultation.phone)}</td></tr>` : ''}
        ${consultation.service ? `<tr><td style="padding:8px 0;font-weight:bold;">Dịch vụ:</td><td style="padding:8px 0;">${this.escapeHtml(consultation.service)}</td></tr>` : ''}
        <tr>
          <td style="padding:8px 0;font-weight:bold;vertical-align:top;">Nội dung:</td>
          <td style="padding:8px 0;">${this.escapeHtml(consultation.message)}</td>
        </tr>
      </table>
    `);
  }

  private buildPasswordResetHtml(name: string, resetUrl: string): string {
    return this.wrapLayout(`
      <h2 style="color:#553722;margin:0 0 16px;">Xin chào ${this.escapeHtml(name)},</h2>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${this.escapeHtml(resetUrl)}"
           style="display:inline-block;padding:12px 32px;background-color:#6F4E37;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Đặt lại mật khẩu
        </a>
      </p>
      <p style="font-size:13px;color:#666;">Liên kết này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
      <p style="margin-top:24px;">Trân trọng,<br><strong>Đội ngũ VietNet Interior</strong></p>
    `);
  }

  private buildWelcomeHtml(name: string): string {
    return this.wrapLayout(`
      <h2 style="color:#553722;margin:0 0 16px;">Chào mừng ${this.escapeHtml(name)}!</h2>
      <p>Tài khoản của bạn tại <strong>VietNet Interior</strong> đã được tạo thành công.</p>
      <p>Bạn có thể đăng nhập vào hệ thống quản trị để quản lý nội dung website.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="https://bhquan.site/admin"
           style="display:inline-block;padding:12px 32px;background-color:#6F4E37;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Truy cập Admin
        </a>
      </p>
      <p style="margin-top:24px;">Trân trọng,<br><strong>Đội ngũ VietNet Interior</strong></p>
    `);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
