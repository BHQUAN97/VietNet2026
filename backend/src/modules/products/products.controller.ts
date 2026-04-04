import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateImagesDto } from './dto/update-images.dto';
import { QueryProductDto, QueryProductAdminDto } from './dto/query-product.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { CrudController } from '../../common/base/base-crud.controller';

@Controller('products')
export class ProductsController extends CrudController<any> {
  protected readonly entityName = 'Product';

  constructor(protected readonly service: ProductsService) {
    super();
  }

  // ─── Override: public list voi product-specific filters ──────

  @Public()
  @Get()
  async findPublished(@Query() query: QueryProductDto) {
    // Loai bo status — findPublished da hardcode status = 'published'
    const { category_id, material_type, finish, is_featured, status: _status, ...pagination } = query;
    const filters = { category_id, material_type, finish, is_featured };
    const result = await this.service.findPublished(pagination, filters);
    return paginated(result.data, result.meta);
  }

  // ─── Override: admin list voi product-specific filters ───────

  @Get('admin/list')
  @AdminOnly()
  async findAllAdmin(@Query() query: QueryProductAdminDto) {
    const { category_id, is_featured, status, search, material_type, finish, ...pagination } = query as any;
    const filters = { category_id, material_type, finish, status, is_featured };
    const result = await this.service.findAllAdmin(pagination, filters, search);
    return paginated(result.data, result.meta);
  }

  // ─── Override: detail by slug voi images ─────────────────────

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.service.findPublishedBySlug(slug);
    const images = await this.service.getImages(product.id);
    return ok({ ...product, images });
  }

  // ─── Override: create voi images ─────────────────────────────

  @Post()
  @AdminOnly()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.service.createWithImages(dto);
    return ok(product, 'Product created successfully');
  }

  // ─── Override: update voi images ─────────────────────────────

  @Patch(':id')
  @AdminOnly()
  async update(@Param('id', ParseUlidPipe) id: string, @Body() dto: UpdateProductDto) {
    const { image_ids, ...productData } = dto as CreateProductDto & Partial<CreateProductDto>;
    const product = await this.service.update(id, productData);

    if (image_ids !== undefined) {
      await this.service.updateImages(product.id, image_ids);
    }

    return ok(product, 'Product updated successfully');
  }

  // ─── Product-specific: image management ──────────────────────

  @Patch(':id/images')
  @AdminOnly()
  async updateImages(
    @Param('id', ParseUlidPipe) id: string,
    @Body() dto: UpdateImagesDto,
  ) {
    await this.service.updateImages(id, dto.image_ids);
    return ok(null, 'Product images updated successfully');
  }
}
