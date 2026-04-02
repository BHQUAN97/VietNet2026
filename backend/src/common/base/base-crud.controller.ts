import {
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ok, paginated } from '../helpers/response.helper';
import { Public } from '../decorators/public.decorator';
import { AdminOnly } from '../decorators/admin-only.decorator';
import { ParseUlidPipe } from '../pipes/parse-ulid.pipe';
import { PublishableService } from './base-publishable.service';
import { PaginationDto } from '../dto/pagination.dto';
import type { ObjectLiteral } from 'typeorm';

/**
 * CrudControllerMixin — gom 7 endpoint CRUD chung cho publishable entities.
 *
 * Subclass chi can:
 * 1. Extends class nay
 * 2. Inject service vao constructor
 * 3. Them cac endpoint RIENG (vd: updateImages, updateGallery)
 *
 * NOTE: NestJS decorator inheritance co han che — decorators tren method
 * cua base class SE duoc ke thua khi subclass KHONG override method do.
 * Neu subclass override, phai re-apply decorators.
 */
export abstract class CrudController<
  T extends ObjectLiteral & { id: string },
> {
  protected abstract readonly service: PublishableService<T>;
  protected abstract readonly entityName: string;

  // ─── Public endpoints ────────────────────────────────────────

  /**
   * GET / — Public list published entities.
   * Subclass PHAI override neu can custom filter logic (vd: category slug).
   */
  @Public()
  @Get()
  async findPublished(@Query() query: PaginationDto) {
    const result = await this.service.findPublished(query);
    return paginated(result.data, result.meta);
  }

  /**
   * GET /:slug — Public detail by slug.
   * Dung findPublishedBySlug de CHI tra published content cho public.
   * Override trong subclass neu can them logic (vd: increment view count).
   */
  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const entity = await this.service.findPublishedBySlug(slug);
    return ok(entity);
  }

  // ─── Admin endpoints ─────────────────────────────────────────

  /**
   * GET /admin/list — Admin list all entities (all statuses).
   * Subclass PHAI override neu can extract filters tu query DTO rieng.
   */
  @Get('admin/list')
  @AdminOnly()
  async findAllAdmin(@Query() query: PaginationDto) {
    const result = await this.service.findAll(query);
    return paginated(result.data, result.meta);
  }

  // NOTE: create() va update() KHONG co o base — subclass PHAI define
  // voi proper DTO type de ValidationPipe whitelist hoat dong.
  // Neu base co @Body() dto: any, ValidationPipe se skip validation.

  /** PATCH /:id/publish — Publish entity. Admin only. */
  @Patch(':id/publish')
  @AdminOnly()
  async publish(@Param('id', ParseUlidPipe) id: string) {
    const entity = await this.service.publish(id);
    return ok(entity, `${this.entityName} published successfully`);
  }

  /** DELETE /:id — Soft delete entity. Admin only. */
  @Delete(':id')
  @AdminOnly()
  async remove(@Param('id', ParseUlidPipe) id: string) {
    await this.service.softDelete(id);
    return ok(null, `${this.entityName} deleted successfully`);
  }
}
