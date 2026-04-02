import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageConfig } from './entities/page-config.entity';
import { PageConfigHistory } from './entities/page-config-history.entity';
import { CreatePageConfigDto } from './dto/create-page-config.dto';
import { UpdatePageConfigDto } from './dto/update-page-config.dto';
import { generateUlid } from '../../common/helpers/ulid.helper';
import { ActionLogger } from '../../common/helpers/logger.helper';

@Injectable()
export class PagesService {
  private readonly actionLogger = new ActionLogger('PagesService');

  constructor(
    @InjectRepository(PageConfig)
    private readonly pageConfigRepo: Repository<PageConfig>,
    @InjectRepository(PageConfigHistory)
    private readonly historyRepo: Repository<PageConfigHistory>,
  ) {}

  async create(dto: CreatePageConfigDto, userId: string): Promise<PageConfig> {
    const existing = await this.pageConfigRepo.findOne({
      where: { page_slug: dto.page_slug },
    });
    if (existing) {
      throw new ConflictException(
        `Page config with slug "${dto.page_slug}" already exists`,
      );
    }

    const entity = this.pageConfigRepo.create({
      id: generateUlid(),
      page_slug: dto.page_slug,
      config_draft: dto.config_draft || { sections: [] },
      updated_by: userId,
    });

    const saved = await this.pageConfigRepo.save(entity);
    this.actionLogger.log(`Page config created: ${dto.page_slug}`);
    return saved;
  }

  async findBySlug(slug: string): Promise<PageConfig> {
    const config = await this.pageConfigRepo.findOne({
      where: { page_slug: slug },
    });
    if (!config) {
      throw new NotFoundException(
        `Page config with slug "${slug}" not found`,
      );
    }
    return config;
  }

  async getPublished(slug: string): Promise<Record<string, unknown> | null> {
    const config = await this.findBySlug(slug);
    return config.config_published;
  }

  async getDraft(slug: string): Promise<Record<string, unknown> | null> {
    const config = await this.findBySlug(slug);
    return config.config_draft;
  }

  async listAll(): Promise<PageConfig[]> {
    return this.pageConfigRepo.find({
      order: { page_slug: 'ASC' },
    });
  }

  /**
   * Validate that config_draft has a valid structure:
   * must be an object with a "sections" array, each section having type, order, visible, and config.
   */
  private validateConfigDraft(draft: Record<string, unknown>): void {
    if (!draft || typeof draft !== 'object') {
      throw new BadRequestException('config_draft must be a valid object');
    }

    const sections = (draft as any).sections;
    if (!Array.isArray(sections)) {
      throw new BadRequestException('config_draft.sections must be an array');
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section || typeof section !== 'object') {
        throw new BadRequestException(`config_draft.sections[${i}] must be an object`);
      }
      if (typeof section.type !== 'string' || !section.type) {
        throw new BadRequestException(`config_draft.sections[${i}].type is required and must be a string`);
      }
      if (typeof section.order !== 'number') {
        throw new BadRequestException(`config_draft.sections[${i}].order is required and must be a number`);
      }
      if (typeof section.visible !== 'boolean') {
        throw new BadRequestException(`config_draft.sections[${i}].visible is required and must be a boolean`);
      }
      if (section.config === undefined || section.config === null || typeof section.config !== 'object') {
        throw new BadRequestException(`config_draft.sections[${i}].config is required and must be an object`);
      }
    }
  }

  async updateDraft(
    slug: string,
    dto: UpdatePageConfigDto,
    userId: string,
  ): Promise<PageConfig> {
    const config = await this.findBySlug(slug);

    this.validateConfigDraft(dto.config_draft);

    config.config_draft = dto.config_draft;
    config.updated_by = userId;

    const saved = await this.pageConfigRepo.save(config);
    this.actionLogger.log(`Draft updated for page: ${slug}`);
    return saved;
  }

  async publish(slug: string, userId: string): Promise<PageConfig> {
    const config = await this.findBySlug(slug);

    if (!config.config_draft) {
      throw new BadRequestException('No draft content to publish');
    }

    // Save current published version to history (if exists)
    if (config.config_published && config.version > 0) {
      const history = this.historyRepo.create({
        id: generateUlid(),
        page_config_id: config.id,
        config_snapshot: config.config_published,
        version: config.version,
        published_at: config.published_at,
        published_by: config.published_by,
      });
      await this.historyRepo.save(history);
    }

    // Publish draft
    config.config_published = config.config_draft;
    config.version = config.version + 1;
    config.published_at = new Date();
    config.published_by = userId;
    config.updated_by = userId;

    const saved = await this.pageConfigRepo.save(config);
    this.actionLogger.log(
      `Page "${slug}" published — version ${saved.version}`,
    );

    // Trigger ISR revalidation
    this.triggerRevalidation([`/${slug === 'homepage' ? '' : slug}`], [slug]);

    return saved;
  }

  private async triggerRevalidation(
    paths: string[],
    tags: string[],
  ): Promise<void> {
    const nextUrl =
      process.env.NEXT_REVALIDATE_URL || 'http://localhost:3000';
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) return;

    try {
      await fetch(`${nextUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, paths, tags }),
      });
    } catch (err) {
      this.actionLogger.warn(`Revalidation request failed: ${err}`);
    }
  }

  async getHistory(slug: string): Promise<PageConfigHistory[]> {
    const config = await this.findBySlug(slug);
    return this.historyRepo.find({
      where: { page_config_id: config.id },
      order: { version: 'DESC' },
    });
  }

  async rollback(
    slug: string,
    version: number,
    userId: string,
  ): Promise<PageConfig> {
    const config = await this.findBySlug(slug);

    const history = await this.historyRepo.findOne({
      where: { page_config_id: config.id, version },
    });
    if (!history) {
      throw new NotFoundException(
        `Version ${version} not found for page "${slug}"`,
      );
    }

    // Set draft to the historical version
    config.config_draft = history.config_snapshot;
    config.updated_by = userId;

    const saved = await this.pageConfigRepo.save(config);
    this.actionLogger.log(
      `Page "${slug}" draft rolled back to version ${version}`,
    );
    return saved;
  }
}
