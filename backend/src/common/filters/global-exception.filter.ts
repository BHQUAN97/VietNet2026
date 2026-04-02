import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LogsService } from '../../modules/logs/logs.service';
import { LogLevel } from '../../modules/logs/entities/app-log.entity';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(@Inject(LogsService) private readonly logsService: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let stackTrace: string | null = null;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(resp.message)) {
          message = resp.message.join(', ');
        } else if (typeof resp.message === 'string') {
          message = resp.message;
        }
      }

      stackTrace = exception.stack || null;
    } else if (exception instanceof Error) {
      message = exception.message;
      stackTrace = exception.stack || null;
      this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
    }

    // Xác định log level dựa trên status code
    const level = statusCode >= 500
      ? LogLevel.ERROR
      : statusCode >= 400
        ? LogLevel.WARN
        : LogLevel.INFO;

    // Ghi log vào DB (async, không chặn response)
    const user = (request as any).user;
    this.logsService.write({
      level,
      message: message.substring(0, 500),
      stack_trace: stackTrace,
      endpoint: `${request.method} ${request.path}`,
      status_code: statusCode,
      ip: request.ip || request.socket?.remoteAddress || null,
      user_id: user?.id || null,
      user_agent: (request.headers['user-agent'] || '').substring(0, 500) || null,
      context: this.buildContext(request, statusCode),
    }).catch(() => {
      // Không throw — tránh infinite loop
    });

    // Response trả về client — KHÔNG bao giờ gửi stack trace
    response.status(statusCode).json({
      success: false,
      data: null,
      message,
      statusCode,
    });
  }

  /** Build context chứa thông tin request (chỉ cho 4xx/5xx) */
  private buildContext(request: Request, statusCode: number): Record<string, unknown> | null {
    if (statusCode < 400) return null;

    const ctx: Record<string, unknown> = {};

    // Query params
    if (Object.keys(request.query || {}).length > 0) {
      ctx.query = request.query;
    }

    // Route params
    if (Object.keys(request.params || {}).length > 0) {
      ctx.params = request.params;
    }

    // Body (ẩn password/token)
    if (request.body && typeof request.body === 'object') {
      const sanitized = { ...request.body };
      for (const key of ['password', 'token', 'refresh_token', 'password_hash', 'secret']) {
        if (key in sanitized) sanitized[key] = '***';
      }
      ctx.body = sanitized;
    }

    return Object.keys(ctx).length > 0 ? ctx : null;
  }
}
