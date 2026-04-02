import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageConfigDto } from './dto/create-page-config.dto';
import { UpdatePageConfigDto } from './dto/update-page-config.dto';
import { ok } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly, EditorOnly } from '../../common/decorators/admin-only.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pages')
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
  @AdminOnly()
  async listAll() {
    const configs = await this.pagesService.listAll();
    return ok(configs);
  }

  @Get(':slug/draft')
  @EditorOnly()
  async getDraft(@Param('slug') slug: string) {
    const config = await this.pagesService.findBySlug(slug);
    return ok(config);
  }

  @Post()
  @AdminOnly()
  async create(
    @Body() dto: CreatePageConfigDto,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.create(dto, userId);
    return ok(config, 'Page config created successfully');
  }

  @Patch(':slug/draft')
  @EditorOnly()
  async updateDraft(
    @Param('slug') slug: string,
    @Body() dto: UpdatePageConfigDto,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.updateDraft(slug, dto, userId);
    return ok(config, 'Draft updated successfully');
  }

  @Post(':slug/publish')
  @AdminOnly()
  async publish(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.publish(slug, userId);
    return ok(config, 'Page published successfully');
  }

  @Get(':slug/history')
  @AdminOnly()
  async getHistory(@Param('slug') slug: string) {
    const history = await this.pagesService.getHistory(slug);
    return ok(history);
  }

  @Post(':slug/rollback/:version')
  @AdminOnly()
  async rollback(
    @Param('slug') slug: string,
    @Param('version', ParseIntPipe) version: number,
    @CurrentUser('id') userId: string,
  ) {
    const config = await this.pagesService.rollback(slug, version, userId);
    return ok(config, `Draft rolled back to version ${version}`);
  }
}
