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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateImagesDto } from './dto/update-images.dto';
import { QueryProductDto, QueryProductAdminDto } from './dto/query-product.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { validateUlid } from '../../common/helpers/ulid.helper';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /products — Public list of published products with optional filters.
   */
  @Public()
  @Get()
  async findPublished(@Query() query: QueryProductDto) {
    const { category_id, material_type, finish, ...pagination } = query;
    const filters = {
      category_id,
      material_type,
      finish,
    };
    const result = await this.productsService.findPublished(pagination, filters);
    return paginated(result.data, {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.total,
    });
  }

  /**
   * GET /products/admin/list — Admin list of all products (all statuses).
   */
  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAllAdmin(@Query() query: QueryProductAdminDto) {
    const { category_id, material_type, finish, status, search, ...pagination } = query;
    const filters = {
      category_id,
      material_type,
      finish,
      status,
    };
    const result = await this.productsService.findAll(pagination, filters);
    return paginated(result.data, {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.total,
    });
  }

  /**
   * GET /products/:slug — Public product detail by slug.
   */
  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    const images = await this.productsService.getImages(product.id);
    return ok({ ...product, images });
  }

  /**
   * POST /products — Create a new product. Admin only.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.createWithImages(dto);
    return ok(product, 'Product created successfully');
  }

  /**
   * PATCH /products/:id — Update a product. Admin only.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    if (!validateUlid(id)) throw new BadRequestException('Invalid product ID');
    const { image_ids, ...productData } = dto as CreateProductDto & Partial<CreateProductDto>;
    const product = await this.productsService.update(id, productData);

    if (image_ids !== undefined) {
      await this.productsService.updateImages(product.id, image_ids);
    }

    return ok(product, 'Product updated successfully');
  }

  /**
   * PATCH /products/:id/images — Update product images. Admin only.
   */
  @Patch(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateImages(
    @Param('id') id: string,
    @Body() dto: UpdateImagesDto,
  ) {
    if (!validateUlid(id)) throw new BadRequestException('Invalid product ID');
    await this.productsService.updateImages(id, dto.image_ids);
    return ok(null, 'Product images updated successfully');
  }

  /**
   * PATCH /products/:id/publish — Publish a product. Admin only.
   */
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async publish(@Param('id') id: string) {
    if (!validateUlid(id)) throw new BadRequestException('Invalid product ID');
    const product = await this.productsService.publish(id);
    return ok(product, 'Product published successfully');
  }

  /**
   * DELETE /products/:id — Soft delete a product. Admin only.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    if (!validateUlid(id)) throw new BadRequestException('Invalid product ID');
    await this.productsService.softDelete(id);
    return ok(null, 'Product deleted successfully');
  }
}
