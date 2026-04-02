import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { ProjectGallery } from './entities/project-gallery.entity';
import { PublishableService } from '../../common/base/base-publishable.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MediaAssociation } from '../../common/services/base-media-association.service';

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

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectGallery)
    private readonly galleryRepo: Repository<ProjectGallery>,
  ) {
    super(projectRepo, 'Project');
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

  async findPublishedBySlug(slug: string): Promise<Project & { gallery: ProjectGallery[] }> {
    const project = await super.findPublishedBySlug(slug);
    return this.loadWithGallery(project);
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

    const project = await super.create(data);

    if (galleryIds && galleryIds.length > 0) {
      await this.updateGallery(project.id, galleryIds);
    }

    return project;
  }

  async update(id: string, data: DeepPartial<Project> & { gallery_ids?: string[] }): Promise<Project> {
    const galleryIds = data.gallery_ids;
    delete data.gallery_ids;

    const project = await super.update(id, data);

    if (galleryIds !== undefined) {
      await this.updateGallery(project.id, galleryIds || []);
    }

    return project;
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
