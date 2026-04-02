import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { QueryProjectDto, QueryProjectAdminDto } from './dto/query-project.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { CrudController } from '../../common/base/base-crud.controller';

@Controller('projects')
export class ProjectsController extends CrudController<any> {
  protected readonly entityName = 'Project';

  constructor(protected readonly service: ProjectsService) {
    super();
  }

  // ─── Override: public list voi category slug + is_featured ───

  @Public()
  @Get()
  async findPublished(@Query() query: QueryProjectDto) {
    const { category, is_featured, status, ...pagination } = query;
    const filters = { category, is_featured, status };
    const result = await this.service.findPublished(pagination, filters);
    return paginated(result.data, result.meta);
  }

  // ─── Override: admin list voi filters ────────────────────────

  @Get('admin/list')
  @AdminOnly()
  async findAllAdmin(@Query() query: QueryProjectAdminDto) {
    const { category_id, status, is_featured, search, ...pagination } = query;
    const filters = { category_id, status, is_featured };
    const result = await this.service.findAll(pagination, filters);
    return paginated(result.data, result.meta);
  }

  // ─── Override: detail + view count ───────────────────────────

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const project = await this.service.findPublishedBySlug(slug);
    this.service.incrementViewCount(project.id).catch(() => {});
    return ok(project);
  }

  // ─── Project-specific: gallery management ────────────────────

  @Patch(':id/gallery')
  @AdminOnly()
  async updateGallery(
    @Param('id', ParseUlidPipe) id: string,
    @Body('media_ids') mediaIds: string[],
  ) {
    if (!Array.isArray(mediaIds)) {
      throw new BadRequestException('media_ids must be an array of strings');
    }
    const gallery = await this.service.updateGallery(id, mediaIds);
    return ok(gallery, 'Gallery updated successfully');
  }
}
