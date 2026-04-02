import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { ActionLogger } from '../../common/helpers/logger.helper';

export interface CreateNotificationDto {
  user_id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  private readonly actionLogger = new ActionLogger('NotificationsService');

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    private readonly gateway: NotificationsGateway,
  ) {}

  /**
   * Create a notification for a specific user and push via Socket.io.
   */
  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepo.create({
      user_id: dto.user_id,
      type: dto.type,
      title: dto.title,
      body: dto.body || null,
      link: dto.link || null,
    });

    const saved = await this.notificationsRepo.save(notification);

    // Push real-time notification to user
    this.gateway.emitToUser(dto.user_id, 'notification', {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      body: saved.body,
      link: saved.link,
      created_at: saved.created_at,
    });

    return saved;
  }

  /**
   * Create a notification for ALL admin users and emit to admin room.
   */
  async notifyAdmins(
    type: string,
    title: string,
    body?: string,
    link?: string,
  ): Promise<void> {
    // Emit real-time event to admin room
    this.gateway.emitToAdmin('notification', {
      type,
      title,
      body: body || null,
      link: link || null,
      created_at: new Date(),
    });

    this.actionLogger.log(`Admin notification emitted: ${type} - ${title}`);
  }

  /**
   * Get all notifications for a user, newest first.
   */
  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.notificationsRepo.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    const unreadCount = await this.notificationsRepo.count({
      where: { user_id: userId, is_read: false },
    });

    return { data, total, unreadCount };
  }

  /**
   * Get unread count for a user.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepo.count({
      where: { user_id: userId, is_read: false },
    });
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationsRepo.update(
      { id, user_id: userId },
      { is_read: true },
    );
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepo.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
  }
}
