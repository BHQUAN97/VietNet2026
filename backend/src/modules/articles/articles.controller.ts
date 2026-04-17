import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Logger,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto, QueryArticleAdminDto } from './dto/query-article.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly, EditorOnly } from '../../common/decorators/admin-only.decorator';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { CrudController } from '../../common/base/base-crud.controller';

@Controller('articles')
export class ArticlesController extends CrudController<any> {
  protected readonly entityName = 'Article';
  private readonly logger = new Logger(ArticlesController.name);

  constructor(protected readonly service: ArticlesService) {
    super();
  }

  // ─── Override: public list voi category slug filter ──────────

  @Public()
  @Get()
  async findPublished(@Query() query: QueryArticleDto) {
    const { category, is_featured, status, ...pagination } = query;
    const filters = { category, is_featured, status };
    const result = await this.service.findPublished(pagination, filters);
    return paginated(result.data, result.meta);
  }

  // ─── Override: admin list voi filters ────────────────────────

  @Get('admin/list')
  @AdminOnly()
  async findAllAdmin(@Query() query: QueryArticleAdminDto) {
    const { category_id, is_featured, status, search, ...pagination } = query;
    const filters = { category_id, status, is_featured };
    const result = await this.service.findAllAdmin(pagination, filters, search);
    return paginated(result.data, result.meta);
  }

  // ─── Admin detail by ID (draft + published) ─────────────────

  @Get('admin/:id')
  @AdminOnly()
  async findOneAdmin(@Param('id', ParseUlidPipe) id: string) {
    const article = await this.service.findById(id);
    return ok(article);
  }

  // ─── Override: detail + view count ───────────────────────────

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.service.findPublishedBySlug(slug);
    // Fire-and-forget de khong block response; log error thay vi swallow im lang
    this.service.incrementViewCount(article.id).catch((err) => {
      this.logger.warn(`incrementViewCount failed for article ${article.id}: ${err?.message ?? err}`);
    });
    return ok(article);
  }

  // ─── Article-specific: related ───────────────────────────────

  @Public()
  @Get(':id/related')
  async findRelated(@Param('id', ParseUlidPipe) id: string) {
    const related = await this.service.findRelated(id);
    return ok(related);
  }

  // ─── Override: EditorOnly cho create/update ──────────────────

  @Post()
  @EditorOnly()
  async create(@Body() dto: CreateArticleDto) {
    const article = await this.service.create(dto);
    return ok(article, 'Article created successfully');
  }

  @Patch(':id')
  @EditorOnly()
  async update(@Param('id', ParseUlidPipe) id: string, @Body() dto: UpdateArticleDto) {
    const article = await this.service.update(id, dto);
    return ok(article, 'Article updated successfully');
  }
}
