import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, DeepPartial } from 'typeorm';
import Redis from 'ioredis';
import { Project, ProjectStatus } from './entities/project.entity';
import { ProjectGallery } from './entities/project-gallery.entity';
import { PublishableService } from '../../common/base/base-publishable.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MediaAssociation } from '../../common/services/base-media-association.service';
import { sanitizeRichText } from '../../common/utils/sanitize-html.util';
import { Cacheable, CacheEvict, InjectRedis } from '../../common/decorators/cacheable.decorator';

@Injectable()
export class ProjectsService extends PublishableService<Project> {
  // ─── Config ──────────────────────────────────────────────────
  protected readonly slugSourceField = 'title' as const;
  protected readonly queryAlias = 'p';
  protected readonly defaultRelations = ['category', 'cover_image'];
  protected readonly detailRelations = ['category', 'cover_image', 'og_image'];
  protected readonly sortAllowlist = {
    display_order: 'p.display_order',
    created_at: 'p.created_at',
    published_at: 'p.published_at',
  };
  protected readonly defaultSortColumns: [string, 'ASC' | 'DESC'][] = [
    ['display_order', 'ASC'],
    ['created_at', 'DESC'],
  ];
  // Base-level sanitizer chay khi true; ta tat de dung sanitizeRichText rieng ben duoi
  protected readonly sanitizeContent = false;

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectGallery)
    private readonly galleryRepo: Repository<ProjectGallery>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRedis() protected readonly redisClient: Redis,
  ) {
    super(projectRepo, 'Project');
  }

  // ─── Sanitize TipTap HTML content/description truoc khi luu DB ──
  protected async beforeSave(
    data: DeepPartial<Project>,
  ): Promise<DeepPartial<Project>> {
    const enriched = await super.beforeSave(data);
    if ((enriched as any).content !== undefined && (enriched as any).content !== null) {
      (enriched as any).content = sanitizeRichText(
        (enriched as any).content as string,
      );
    }
    if ((enriched as any).description !== undefined && (enriched as any).description !== null) {
      (enriched as any).description = sanitizeRichText(
        (enriched as any).description as string,
      );
    }
    return enriched;
  }

  // ─── Override findBySlug + findPublishedBySlug: load gallery kem ──

  /** Helper: load gallery cho project */
  private async loadWithGallery(project: Project): Promise<Project & { gallery: ProjectGallery[] }> {
    const gallery = await this.galleryRepo.find({
      where: { project_id: project.id },
      relations: ['media'],
      order: { display_order: 'ASC' },
    });
    return { ...project, gallery } as any;
  }

  async findBySlug(slug: string): Promise<Project & { gallery: ProjectGallery[] }> {
    const project = await super.findBySlug(slug);
    return this.loadWithGallery(project);
  }

  @Cacheable({
    key: (...args: unknown[]) => `project:slug:${args[0] as string}`,
    ttl: 300,
  })
  async findPublishedBySlug(slug: string): Promise<Project & { gallery: ProjectGallery[] }> {
    const project = await super.findPublishedBySlug(slug);
    return this.loadWithGallery(project);
  }

  // ─── Admin list voi LIKE search ──────────────────────────────

  async findAllAdmin(
    pagination: PaginationDto,
    filters?: Record<string, unknown>,
    search?: string,
  ) {
    const qb = this.createBaseQuery(this.queryAlias);

    for (const rel of this.defaultRelations) {
      qb.leftJoinAndSelect(`${this.queryAlias}.${rel}`, rel);
    }

    // LIKE search tren title va description
    if (search?.trim()) {
      const searchTerm = `%${search.trim()}%`;
      qb.andWhere(
        `(${this.queryAlias}.title LIKE :search OR ${this.queryAlias}.description LIKE :search)`,
        { search: searchTerm },
      );
    }

    return this.executeWithDefaultSort(qb, pagination, filters);
  }

  // ─── Override findPublished: category slug + is_featured ─────

  async findPublished(
    pagination: PaginationDto,
    filters?: Record<string, unknown>,
  ) {
    const qb = this.createBaseQuery(this.queryAlias);

    for (const rel of this.defaultRelations) {
      qb.leftJoinAndSelect(`${this.queryAlias}.${rel}`, rel);
    }

    qb.andWhere(`${this.queryAlias}.status = :status`, {
      status: ProjectStatus.PUBLISHED,
    });

    // Category slug filter
    const categorySlug = filters?.category as string | undefined;
    if (categorySlug) {
      this.applyCategorySlugFilter(qb, categorySlug);
    }

    // is_featured filter
    const isFeatured = filters?.is_featured;
    if (isFeatured !== undefined) {
      qb.andWhere(`${this.queryAlias}.is_featured = :isFeatured`, { isFeatured });
    }

    return this.executeWithDefaultSort(qb, pagination);
  }

  // ─── Create/Update voi gallery_ids ───────────────────────────

  async create(data: DeepPartial<Project> & { gallery_ids?: string[] }): Promise<Project> {
    const galleryIds = data.gallery_ids;
    delete data.gallery_ids;

    // Wrap trong transaction: neu sync gallery fail thi rollback project khoi DB
    return this.dataSource.transaction(async () => {
      const project = await super.create(data);
      if (galleryIds && galleryIds.length > 0) {
        await this.updateGallery(project.id, galleryIds);
      }
      return project;
    });
  }

  @CacheEvict({ pattern: 'project:*' })
  async update(id: string, data: DeepPartial<Project> & { gallery_ids?: string[] }): Promise<Project> {
    const galleryIds = data.gallery_ids;
    delete data.gallery_ids;

    // Wrap trong transaction: update project va gallery cung atomic
    return this.dataSource.transaction(async () => {
      const project = await super.update(id, data);
      if (galleryIds !== undefined) {
        await this.updateGallery(project.id, galleryIds || []);
      }
      return project;
    });
  }

  @CacheEvict({ pattern: 'project:*' })
  async softDelete(id: string): Promise<void> {
    return super.softDelete(id);
  }

  @CacheEvict({ pattern: 'project:*' })
  async publish(id: string): Promise<Project> {
    return super.publish(id);
  }

  // ─── Gallery management (dung MediaAssociation helper) ────────

  async updateGallery(
    projectId: string,
    mediaIds: string[],
  ): Promise<ProjectGallery[]> {
    await this.findById(projectId);
    return MediaAssociation.sync(this.galleryRepo, {
      entityIdField: 'project_id',
      entityId: projectId,
      mediaIds,
    });
  }
}
