import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageConfigDto } from './dto/create-page-config.dto';
import { UpdatePageConfigDto } from './dto/update-page-config.dto';
import { ok } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // ─── Public ────────────────────────────────────────────

  @Get(':slug/published')
  @Public()
  async getPublished(@Param('slug') slug: string) {
    const config = await this.pagesService.getPublished(slug);
    return ok(config);
  }

  @Get(':slug/preview')
  @Public()
  async getPreview(
    @Param('slug') slug: string,
    @Query('secret') secret: string,
  ) {
    const previewSecret =
      process.env.PREVIEW_SECRET || process.env.REVALIDATE_SECRET;
    if (!previewSecret || secret !== previewSecret) {
      throw new UnauthorizedException('Invalid preview secret');
    }
    const config = await this.pagesService.findBySlug(slug);
    return ok(config);
  }

  // ─── Admin ─────────────────────────────────────────────

  @Get('admin/list')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async listAll() {
    const configs = await this.pagesService.listAll();
    return ok(configs);
  }

  @Get(':slug/draft')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  async getDraft(@Param('slug') slug: string) {
    const config = await this.pagesService.findBySlug(slug);
    return ok(config);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(
    @Body() dto: CreatePageConfigDto,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.create(dto, userId);
    return ok(config, 'Page config created successfully');
  }

  @Patch(':slug/draft')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  async updateDraft(
    @Param('slug') slug: string,
    @Body() dto: UpdatePageConfigDto,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.updateDraft(slug, dto, userId);
    return ok(config, 'Draft updated successfully');
  }

  @Post(':slug/publish')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async publish(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.publish(slug, userId);
    return ok(config, 'Page published successfully');
  }

  @Get(':slug/history')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getHistory(@Param('slug') slug: string) {
    const history = await this.pagesService.getHistory(slug);
    return ok(history);
  }

  @Post(':slug/rollback/:version')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async rollback(
    @Param('slug') slug: string,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.rollback(slug, version, userId);
    return ok(config, `Draft rolled back to version ${version}`);
  }
}
