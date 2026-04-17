import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto, QueryProjectAdminDto } from './dto/query-project.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { CrudController } from '../../common/base/base-crud.controller';

@Controller('projects')
export class ProjectsController extends CrudController<any> {
  protected readonly entityName = 'Project';
  private readonly logger = new Logger(ProjectsController.name);

  constructor(protected readonly service: ProjectsService) {
    super();
  }

  // ─── Create project (admin) ─────────────────────────────────

  @Post()
  @AdminOnly()
  async create(@Body() dto: CreateProjectDto, @Req() req: any) {
    const project = await this.service.create({
      ...dto,
      created_by: req.user?.id,
    });
    return ok(project, 'Project created successfully');
  }

  // ─── Update project (admin) ─────────────────────────────────

  @Patch(':id')
  @AdminOnly()
  async update(
    @Param('id', ParseUlidPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: any,
  ) {
    const project = await this.service.update(id, {
      ...dto,
      updated_by: req.user?.id,
    });
    return ok(project, 'Project updated successfully');
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
    const result = await this.service.findAllAdmin(pagination, filters, search);
    return paginated(result.data, result.meta);
  }

  // ─── Admin detail by ID (draft + published) ─────────────────

  @Get('admin/:id')
  @AdminOnly()
  async findOneAdmin(@Param('id', ParseUlidPipe) id: string) {
    const project = await this.service.findById(id);
    return ok(project);
  }

  // ─── Override: detail + view count ───────────────────────────

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const project = await this.service.findPublishedBySlug(slug);
    // Fire-and-forget de khong block response; log error thay vi swallow im lang
    this.service.incrementViewCount(project.id).catch((err) => {
      this.logger.warn(`incrementViewCount failed for project ${project.id}: ${err?.message ?? err}`);
    });
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
