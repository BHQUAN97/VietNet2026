import { Logger } from '@nestjs/common';

/**
 * Structured action logging helper.
 * Thong nhat format log across services.
 */
export class ActionLogger {
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  /** Log mot action tren entity: "Article 01HX... created by admin01" */
  action(
    entity: string,
    action: string,
    id: string,
    userId?: string,
  ): void {
    const by = userId ? ` by ${userId}` : '';
    this.logger.log(`${entity} ${id} ${action}${by}`);
  }

  /** Log soft delete */
  softDelete(entity: string, id: string, userId?: string): void {
    this.action(entity, 'soft-deleted', id, userId);
  }

  /** Log publish */
  publish(entity: string, id: string, userId?: string): void {
    this.action(entity, 'published', id, userId);
  }

  /** Log create */
  created(entity: string, id: string, userId?: string): void {
    this.action(entity, 'created', id, userId);
  }

  /** Log update */
  updated(entity: string, id: string, userId?: string): void {
    this.action(entity, 'updated', id, userId);
  }

  /** Log general message */
  log(message: string): void {
    this.logger.log(message);
  }

  /** Log warning */
  warn(message: string): void {
    this.logger.warn(message);
  }

  /** Log error */
  error(message: string, trace?: string): void {
    this.logger.error(message, trace);
  }
}
