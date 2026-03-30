import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { ProjectGallery } from './entities/project-gallery.entity';
import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { validateUlid } from '../../common/helpers/ulid.helper';
import { toSlug } from '../../common/helpers/slug.helper';
import { sanitizeHtml } from '../../common/helpers/sanitize.helper';

@Injectable()
export class ProjectsService extends BaseService<Project> {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectGallery)
    private readonly galleryRepo: Repository<ProjectGallery>,
  ) {
    super(projectRepo);
  }

  /**
   * Hook: auto-generate slug from title before saving.
   */
  protected async beforeSave(
    data: DeepPartial<Project>,
  ): Promise<DeepPartial<Project>> {
    if (data.title) {
      data.slug = toSlug(data.title as string);
    }

    // Sanitize HTML content before saving
    if (data.content) {
      data.content = sanitizeHtml(data.content as string);
    }

    // Validate category_id if provided
    if (data.category_id) {
      if (!validateUlid(data.category_id as string)) {
        throw new BadRequestException('Invalid category_id format');
      }
    }

    // Validate cover_image_id if provided
    if (data.cover_image_id) {
      if (!validateUlid(data.cover_image_id as string)) {
        throw new BadRequestException('Invalid cover_image_id format');
      }
    }

    // Validate og_image_id if provided
    if (data.og_image_id) {
      if (!validateUlid(data.og_image_id as string)) {
        throw new BadRequestException('Invalid og_image_id format');
      }
    }

    return data;
  }

  /**
   * Hook: validate slug uniqueness.
   */
  protected async validate(data: DeepPartial<Project>): Promise<void> {
    if (data.slug) {
      const existing = await this.projectRepo.findOne({
        where: {
          slug: data.slug as string,
          deleted_at: IsNull(),
        },
      });
      if (existing && existing.id !== (data as any).id) {
        throw new ConflictException(
          `Project slug "${data.slug}" already exists`,
        );
      }
    }
  }

  /**
   * Override findAll: exclude soft-deleted, support filtering.
   */
  async findAll(
    pagination: PaginationDto,
    filters?: {
      category_id?: string;
      status?: ProjectStatus;
      is_featured?: boolean;
    },
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.cover_image', 'cover_image')
      .where('p.deleted_at IS NULL');

    if (filters?.category_id) {
      qb.andWhere('p.category_id = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters?.status) {
      qb.andWhere('p.status = :status', { status: filters.status });
    }

    if (filters?.is_featured !== undefined) {
      qb.andWhere('p.is_featured = :isFeatured', {
        isFeatured: filters.is_featured,
      });
    }

    qb.orderBy('p.display_order', 'ASC')
      .addOrderBy('p.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Find project by slug with full relations.
   */
  async findBySlug(slug: string): Promise<Project & { gallery: ProjectGallery[] }> {
    const project = await this.projectRepo.findOne({
      where: { slug, deleted_at: IsNull() },
      relations: ['category', 'cover_image', 'og_image'],
    });

    if (!project) {
      throw new NotFoundException(`Project with slug "${slug}" not found`);
    }

    // Load gallery with media relation
    const gallery = await this.galleryRepo.find({
      where: { project_id: project.id },
      relations: ['media'],
      order: { display_order: 'ASC' },
    });

    return { ...project, gallery } as any;
  }

  /**
   * Find published projects for public API.
   * Optionally filter by category slug.
   */
  async findPublished(
    pagination: PaginationDto,
    categorySlug?: string,
  ) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.cover_image', 'cover_image')
      .where('p.deleted_at IS NULL')
      .andWhere('p.status = :status', { status: ProjectStatus.PUBLISHED });

    if (categorySlug) {
      qb.andWhere('category.slug = :categorySlug', { categorySlug });
      qb.andWhere('category.deleted_at IS NULL');
    }

    qb.orderBy('p.display_order', 'ASC')
      .addOrderBy('p.published_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Override findById to exclude soft-deleted records.
   */
  async findById(id: string): Promise<Project> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }

    const project = await this.projectRepo.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['category', 'cover_image'],
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  /**
   * Create project and handle gallery_ids if provided.
   */
  async create(data: DeepPartial<Project> & { gallery_ids?: string[] }): Promise<Project> {
    const galleryIds = data.gallery_ids;
    delete data.gallery_ids;

    const project = await super.create(data);

    // Handle gallery if provided
    if (galleryIds && galleryIds.length > 0) {
      await this.updateGallery(project.id, galleryIds);
    }

    return project;
  }

  /**
   * Update project and handle gallery_ids if provided.
   */
  async update(id: string, data: DeepPartial<Project> & { gallery_ids?: string[] }): Promise<Project> {
    const galleryIds = data.gallery_ids;
    delete data.gallery_ids;

    const project = await super.update(id, data);

    // Handle gallery if provided
    if (galleryIds !== undefined) {
      await this.updateGallery(project.id, galleryIds || []);
    }

    return project;
  }

  /**
   * Manage project gallery entries with display_order.
   * Replaces all existing gallery entries.
   */
  async updateGallery(
    projectId: string,
    mediaIds: string[],
  ): Promise<ProjectGallery[]> {
    if (!validateUlid(projectId)) {
      throw new BadRequestException('Invalid project ID format');
    }

    // Validate all media IDs
    for (const mediaId of mediaIds) {
      if (!validateUlid(mediaId)) {
        throw new BadRequestException(`Invalid media ID: ${mediaId}`);
      }
    }

    // Verify project exists
    await this.findById(projectId);

    // Remove existing gallery entries
    await this.galleryRepo.delete({ project_id: projectId });

    if (mediaIds.length === 0) {
      return [];
    }

    // Create new gallery entries with display_order
    const entries = mediaIds.map((mediaId, index) =>
      this.galleryRepo.create({
        project_id: projectId,
        media_id: mediaId,
        display_order: index,
      }),
    );

    const saved = await this.galleryRepo.save(entries);
    this.logger.log(
      `Updated gallery for project ${projectId}: ${mediaIds.length} items`,
    );
    return saved;
  }

  /**
   * Soft delete a project by setting deleted_at.
   */
  async softDelete(id: string): Promise<void> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }

    const project = await this.findById(id);
    await this.projectRepo.update(project.id, { deleted_at: new Date() });
    this.logger.log(`Project ${id} soft-deleted`);
  }

  /**
   * Publish a project: set status to published and published_at to now.
   */
  async publish(id: string): Promise<Project> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }

    const project = await this.findById(id);
    await this.projectRepo.update(project.id, {
      status: ProjectStatus.PUBLISHED,
      published_at: new Date(),
    });

    this.logger.log(`Project ${id} published`);
    return this.findById(id);
  }

  /**
   * Increment view count for a project.
   */
  async incrementViewCount(id: string): Promise<void> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }

    await this.projectRepo.increment({ id }, 'view_count', 1);
  }
}
