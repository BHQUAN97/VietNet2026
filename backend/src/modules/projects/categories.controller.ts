import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { CategoryType } from './entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories?type=project
   * List all categories (paginated). Public access.
   */
  @Get()
  @Public()
  async findAll(@Query() query: QueryCategoryDto) {
    const { type, ...pagination } = query;
    const result = await this.categoriesService.findAll(pagination, type);
    return paginated(result.data, result.meta);
  }

  /**
   * GET /categories/tree?type=project
   * Get nested category tree. Public access.
   */
  @Get('tree')
  @Public()
  async findTree(@Query('type') type: CategoryType) {
    if (!type) {
      throw new BadRequestException('Query parameter "type" is required');
    }
    const tree = await this.categoriesService.findTree(type);
    return ok(tree);
  }

  /**
   * GET /categories/:slug
   * Get category by slug. Public access.
   */
  @Get(':slug')
  @Public()
  async findBySlug(
    @Param('slug') slug: string,
    @Query('type') type?: CategoryType,
  ) {
    const category = await this.categoriesService.findBySlug(slug, type);
    return ok(category);
  }

  /**
   * POST /categories
   * Create a new category. Admin only.
   */
  @Post()
  @AdminOnly()
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);
    return ok(category, 'Category created successfully');
  }

  /**
   * PATCH /categories/:id
   * Update a category. Admin only.
   */
  @Patch(':id')
  @AdminOnly()
  async update(
    @Param('id', ParseUlidPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, dto);
    return ok(category, 'Category updated successfully');
  }

  /**
   * DELETE /categories/:id
   * Soft delete a category. Admin only.
   */
  @Delete(':id')
  @AdminOnly()
  async remove(@Param('id', ParseUlidPipe) id: string) {
    await this.categoriesService.softDelete(id);
    return ok(null, 'Category deleted successfully');
  }

  /**
   * POST /categories/seed
   * Seed initial categories. Admin only.
   */
  @Post('seed')
  @AdminOnly()
  async seed() {
    const result = await this.categoriesService.seed();
    return ok(result, `Seeded ${result.seeded} categories`);
  }
}
