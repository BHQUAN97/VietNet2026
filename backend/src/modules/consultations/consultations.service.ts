import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  Consultation,
  ConsultationStatus,
} from './entities/consultation.entity';
import { BaseService } from '../../common/base/base.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailQueueService } from '../../common/services/mail-queue.service';
import { buildSortAllowlist } from '../../common/helpers/sort-validator';

interface ConsultationFilters {
  status?: ConsultationStatus;
  search?: string;
}

/** Sort allowlist cho consultation queries */
const SORT_ALLOWLIST = buildSortAllowlist('c', [
  'created_at',
  'updated_at',
  'name',
  'email',
  'status',
  'status_changed_at',
]);

@Injectable()
export class ConsultationsService extends BaseService<Consultation> {
  constructor(
    @InjectRepository(Consultation)
    private readonly consultationsRepository: Repository<Consultation>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly mailQueueService: MailQueueService,
  ) {
    super(consultationsRepository, 'Consultation');
  }

  /**
   * Public: submit a new consultation request.
   */
  async submit(
    dto: CreateConsultationDto,
    ip?: string,
    userAgent?: string,
  ): Promise<Consultation> {
    // Honeypot check — if filled, silently accept but don't save
    if (dto.honeypot) {
      this.actionLogger.warn(`Honeypot triggered from IP ${ip}`);
      // Return a fake entity to avoid revealing spam detection
      return { id: 'spam-detected' } as Consultation;
    }

    const consultation = this.consultationsRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone || null,
      project_type: dto.project_type || null,
      area: dto.area || null,
      budget_range: dto.budget_range || null,
      message: dto.message,
      source: dto.source || 'contact',
      ip_address: ip || null,
      user_agent: userAgent || null,
    });

    const saved = await this.consultationsRepository.save(consultation);
    this.actionLogger.log(`New consultation ${saved.id} from ${dto.email}`);

    // Queue confirmation email to user
    this.mailQueueService
      .queueConsultationConfirmation(dto.email, dto.name)
      .catch((err) =>
        this.actionLogger.error('Failed to queue confirmation email', err),
      );

    // Queue notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bhquan.site';
    this.mailQueueService
      .queueConsultationNotification(adminEmail, {
        name: dto.name,
        email: dto.email,
        phone: dto.phone || '',
        message: dto.message,
      })
      .catch((err) =>
        this.actionLogger.error('Failed to queue admin notification email', err),
      );

    // Emit real-time Socket.io notification to admin room
    this.notificationsService.notifyAdmins(
      'new_consultation',
      'Yeu cau tu van moi',
      `${dto.name} (${dto.email}) vua gui yeu cau tu van`,
      `/admin/consultations`,
    );

    return saved;
  }

  /**
   * Admin: list all consultations with pagination, status filter, and search.
   */
  async findAllAdmin(pagination: PaginationDto, filters?: ConsultationFilters) {
    const qb = this.createBaseQuery('c')
      .leftJoinAndSelect('c.product', 'product')
      .leftJoinAndSelect('c.assignee', 'assignee');

    // Apply status filter via standard filters mechanism
    const standardFilters: Record<string, unknown> = {};
    if (filters?.status) {
      standardFilters.status = filters.status;
    }

    // Apply search manually (LIKE pattern not supported by applyFilters)
    if (filters?.search) {
      qb.andWhere(
        '(c.name LIKE :search OR c.email LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return this.executePaginatedQuery(qb, 'c', pagination, {
      filters: Object.keys(standardFilters).length ? standardFilters : undefined,
      sortAllowlist: SORT_ALLOWLIST,
    });
  }

  /**
   * Admin: get a single consultation by ID with all relations.
   */
  async findByIdAdmin(id: string): Promise<Consultation> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id, deleted_at: IsNull() } as any,
      relations: ['product', 'assignee'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with id ${id} not found`);
    }

    return consultation;
  }

  /**
   * Admin: update consultation status with timestamp tracking.
   */
  async updateStatus(
    id: string,
    status: ConsultationStatus,
    changedBy: string,
    notes?: string,
  ): Promise<Consultation> {
    await this.findByIdAdmin(id);

    const updateData: Partial<Consultation> = {
      status,
      status_changed_at: new Date(),
      status_changed_by: changedBy,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    await this.consultationsRepository.update(id, updateData as any);
    this.actionLogger.log(
      `Consultation ${id} status updated to ${status} by ${changedBy}`,
    );

    return this.findByIdAdmin(id);
  }

  /**
   * Admin: assign a consultation to an admin user.
   */
  async assignTo(id: string, userId: string): Promise<Consultation> {
    await this.findByIdAdmin(id);

    await this.consultationsRepository.update(id, { assigned_to: userId });
    this.actionLogger.log(`Consultation ${id} assigned to ${userId}`);

    return this.findByIdAdmin(id);
  }

  /**
   * Admin: unified update handler — consolidates status, assignee, and notes updates.
   */
  async updateAdmin(
    id: string,
    dto: UpdateConsultationDto,
    changedBy: string,
  ): Promise<Consultation> {
    await this.findByIdAdmin(id);

    if (dto.status) {
      await this.updateStatus(id, dto.status, changedBy, dto.notes);
    } else if (dto.notes !== undefined) {
      await this.consultationsRepository.update(id, { notes: dto.notes });
    }

    if (dto.assigned_to) {
      await this.assignTo(id, dto.assigned_to);
    }

    return this.findByIdAdmin(id);
  }
}
