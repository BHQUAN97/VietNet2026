import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto, QueryProjectAdminDto } from './dto/query-project.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { validateUlid } from '../../common/helpers/ulid.helper';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ProjectStatus } from './entities/project.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * GET /projects
   * Public list of published projects with pagination and optional category filter.
   */
  @Get()
  @Public()
  async findPublished(@Query() query: QueryProjectDto) {
    const { category, status, ...pagination } = query;
    const result = await this.projectsService.findPublished(
      pagination,
      category,
    );
    return paginated(result.data, result.meta);
  }

  /**
   * GET /projects/admin/list
   * Admin list of all projects (all statuses). Admin only.
   */
  @Get('admin/list')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAllAdmin(@Query() query: QueryProjectAdminDto) {
    const { category_id, status, is_featured, ...pagination } = query;

    // Validate category_id if provided
    if (category_id && !validateUlid(category_id)) {
      throw new BadRequestException('Invalid category_id format');
    }

    const filters: {
      category_id?: string;
      status?: ProjectStatus;
      is_featured?: boolean;
    } = {};

    if (category_id) filters.category_id = category_id;
    if (status) filters.status = status;
    if (is_featured !== undefined) {
      filters.is_featured = is_featured === 'true';
    }

    const result = await this.projectsService.findAll(pagination, filters);
    return paginated(result.data, result.meta);
  }

  /**
   * GET /projects/:slug
   * Public detail by slug. Increments view count.
   */
  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    const project = await this.projectsService.findBySlug(slug);

    // Increment view count asynchronously (fire-and-forget)
    this.projectsService.incrementViewCount(project.id).catch(() => {
      // Silently ignore view count errors
    });

    return ok(project);
  }

  /**
   * POST /projects
   * Create a new project. Admin only.
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(dto);
    return ok(project, 'Project created successfully');
  }

  /**
   * PATCH /projects/:id
   * Update a project. Admin only.
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }
    const project = await this.projectsService.update(id, dto);
    return ok(project, 'Project updated successfully');
  }

  /**
   * PATCH /projects/:id/gallery
   * Update project gallery (array of media IDs). Admin only.
   */
  @Patch(':id/gallery')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateGallery(
    @Param('id') id: string,
    @Body('media_ids') mediaIds: string[],
  ) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }
    if (!Array.isArray(mediaIds)) {
      throw new BadRequestException('media_ids must be an array of strings');
    }
    const gallery = await this.projectsService.updateGallery(id, mediaIds);
    return ok(gallery, 'Gallery updated successfully');
  }

  /**
   * PATCH /projects/:id/publish
   * Publish a project. Admin only.
   */
  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async publish(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }
    const project = await this.projectsService.publish(id);
    return ok(project, 'Project published successfully');
  }

  /**
   * DELETE /projects/:id
   * Soft delete a project. Admin only.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid project ID format');
    }
    await this.projectsService.softDelete(id);
    return ok(null, 'Project deleted successfully');
  }
}
