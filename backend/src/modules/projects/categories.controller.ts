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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { validateUlid } from '../../common/helpers/ulid.helper';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CategoryType } from './entities/category.entity';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories?type=project
   * List all categories (paginated). Public access.
   */
  @Get()
  @Public()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('type') type?: CategoryType,
  ) {
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
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.create(dto);
    return ok(category, 'Category created successfully');
  }

  /**
   * PATCH /categories/:id
   * Update a category. Admin only.
   */
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }
    const category = await this.categoriesService.update(id, dto);
    return ok(category, 'Category updated successfully');
  }

  /**
   * DELETE /categories/:id
   * Soft delete a category. Admin only.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }
    await this.categoriesService.softDelete(id);
    return ok(null, 'Category deleted successfully');
  }

  /**
   * POST /categories/seed
   * Seed initial categories. Admin only.
   */
  @Post('seed')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async seed() {
    const result = await this.categoriesService.seed();
    return ok(result, `Seeded ${result.seeded} categories`);
  }
}
