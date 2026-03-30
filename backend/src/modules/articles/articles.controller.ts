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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { validateUlid } from '../../common/helpers/ulid.helper';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { ArticleStatus } from './entities/article.entity';

@Controller('articles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @Public()
  async findPublished(
    @Query() pagination: PaginationDto,
    @Query('category') categorySlug?: string,
  ) {
    const result = await this.articlesService.findPublished(
      pagination,
      categorySlug,
    );
    return paginated(result.data, result.meta);
  }

  @Get('admin/list')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAllAdmin(
    @Query() pagination: PaginationDto,
    @Query('category_id') categoryId?: string,
    @Query('status') status?: ArticleStatus,
    @Query('is_featured') isFeatured?: string,
  ) {
    if (categoryId && !validateUlid(categoryId)) {
      throw new BadRequestException('Invalid category_id format');
    }

    const filters: {
      category_id?: string;
      status?: ArticleStatus;
      is_featured?: boolean;
    } = {};

    if (categoryId) filters.category_id = categoryId;
    if (status) filters.status = status;
    if (isFeatured !== undefined) {
      filters.is_featured = isFeatured === 'true';
    }

    const result = await this.articlesService.findAll(pagination, filters);
    return paginated(result.data, result.meta);
  }

  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.findBySlug(slug);

    this.articlesService.incrementViewCount(article.id).catch(() => {});

    return ok(article);
  }

  @Get(':id/related')
  @Public()
  async findRelated(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }
    const related = await this.articlesService.findRelated(id);
    return ok(related);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  async create(@Body() dto: CreateArticleDto) {
    const article = await this.articlesService.create(dto);
    return ok(article, 'Article created successfully');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR)
  async update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }
    const article = await this.articlesService.update(id, dto);
    return ok(article, 'Article updated successfully');
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async publish(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }
    const article = await this.articlesService.publish(id);
    return ok(article, 'Article published successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid article ID format');
    }
    await this.articlesService.softDelete(id);
    return ok(null, 'Article deleted successfully');
  }
}
