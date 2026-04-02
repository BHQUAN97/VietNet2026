import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, IsNull } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { toSlug } from '../../common/helpers/slug.helper';

@Injectable()
export class CategoriesService extends BaseService<Category> {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {
    super(categoryRepo, 'Category');
  }

  /**
   * Hook: auto-generate slug from name before saving.
   */
  protected async beforeSave(
    data: DeepPartial<Category>,
  ): Promise<DeepPartial<Category>> {
    // Auto-generate slug tu name
    this.generateSlug(data, 'name');

    // Validate parent_id format neu co
    this.validateForeignKeys(data as any, ['parent_id']);

    // Validate parent exists
    if (data.parent_id) {
      const parent = await this.categoryRepo.findOne({
        where: { id: data.parent_id as string, deleted_at: IsNull() },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent category with id ${data.parent_id} not found`,
        );
      }
    }

    return data;
  }

  /**
   * Hook: validate slug uniqueness per type.
   * Khong dung base validateSlugUnique vi can filter theo type.
   */
  protected async validate(data: DeepPartial<Category>): Promise<void> {
    if (data.slug && data.type) {
      const existing = await this.categoryRepo.findOne({
        where: {
          slug: data.slug as string,
          type: data.type as CategoryType,
          deleted_at: IsNull(),
        },
      });
      if (existing && existing.id !== (data as any).id) {
        throw new NotFoundException(
          `Category slug "${data.slug}" already exists for type "${data.type}"`,
        );
      }
    }
  }

  /**
   * Override findAll: filter by type, order by display_order.
   */
  async findAll(pagination: PaginationDto, type?: CategoryType) {
    const qb = this.createBaseQuery('c');

    if (type) {
      qb.andWhere('c.type = :type', { type });
    }

    return this.executePaginatedQuery(qb, 'c', pagination, {
      sortAllowlist: {
        display_order: 'c.display_order',
        created_at: 'c.created_at',
      },
    });
  }

  /**
   * Return nested category tree for a given type.
   * Parents with children nested inside.
   */
  async findTree(type: CategoryType) {
    const all = await this.categoryRepo.find({
      where: { type, deleted_at: IsNull(), is_active: true },
      order: { display_order: 'ASC' },
    });

    // Build tree: separate parents (no parent_id) and children
    const parentMap = new Map<string, Category & { children: Category[] }>();
    const children: Category[] = [];

    for (const cat of all) {
      if (!cat.parent_id) {
        parentMap.set(cat.id, { ...cat, children: [] } as any);
      } else {
        children.push(cat);
      }
    }

    // Assign children to parents
    for (const child of children) {
      const parent = parentMap.get(child.parent_id!);
      if (parent) {
        parent.children.push(child);
      }
    }

    return Array.from(parentMap.values());
  }

  /**
   * Find category by slug and type.
   */
  async findBySlug(slug: string, type?: CategoryType): Promise<Category> {
    const where: Record<string, unknown> = {
      slug,
      deleted_at: IsNull(),
    };
    if (type) {
      where.type = type;
    }

    const category = await this.categoryRepo.findOne({ where: where as any });
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }
    return category;
  }

  /**
   * Seed initial categories if the table is empty.
   */
  async seed(): Promise<{ seeded: number }> {
    const count = await this.categoryRepo.count({
      where: { deleted_at: IsNull() },
    });

    if (count > 0) {
      this.actionLogger.log('Categories table not empty, skipping seed');
      return { seeded: 0 };
    }

    const seedData: Array<{
      name: string;
      type: CategoryType;
      display_order: number;
    }> = [
      // Project categories
      { name: 'Phòng Khách', type: CategoryType.PROJECT, display_order: 1 },
      { name: 'Phòng Ngủ', type: CategoryType.PROJECT, display_order: 2 },
      { name: 'Phòng Bếp', type: CategoryType.PROJECT, display_order: 3 },
      { name: 'Phòng Tắm', type: CategoryType.PROJECT, display_order: 4 },
      { name: 'Văn Phòng', type: CategoryType.PROJECT, display_order: 5 },
      { name: 'Biệt Thự', type: CategoryType.PROJECT, display_order: 6 },
      { name: 'Căn Hộ', type: CategoryType.PROJECT, display_order: 7 },
      // Product categories
      { name: 'Sofa', type: CategoryType.PRODUCT, display_order: 1 },
      { name: 'Bàn', type: CategoryType.PRODUCT, display_order: 2 },
      { name: 'Ghế', type: CategoryType.PRODUCT, display_order: 3 },
      { name: 'Tủ', type: CategoryType.PRODUCT, display_order: 4 },
      { name: 'Đèn', type: CategoryType.PRODUCT, display_order: 5 },
      { name: 'Phụ Kiện Trang Trí', type: CategoryType.PRODUCT, display_order: 6 },
    ];

    const entities: Category[] = [];
    for (const item of seedData) {
      const slug = toSlug(item.name);
      const entity = this.categoryRepo.create({
        name: item.name,
        slug,
        type: item.type,
        display_order: item.display_order,
        is_active: true,
      });
      entities.push(entity);
    }

    await this.categoryRepo.save(entities);
    this.actionLogger.log(`Seeded ${entities.length} categories`);
    return { seeded: entities.length };
  }
}
