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
   * Seed danh muc mac dinh cho web thiet ke & ban do noi that.
   * Bao gom 4 loai: project, product, article, material.
   * Ho tro cau truc cha-con (parent_id).
   */
  async seed(): Promise<{ seeded: number }> {
    const count = await this.categoryRepo.count({
      where: { deleted_at: IsNull() },
    });

    if (count > 0) {
      this.actionLogger.log('Categories table not empty, skipping seed');
      return { seeded: 0 };
    }

    // --- Dinh nghia danh muc goc (parent) ---
    type SeedItem = {
      name: string;
      description?: string;
      type: CategoryType;
      display_order: number;
      children?: Array<{ name: string; description?: string; display_order: number }>;
    };

    const seedData: SeedItem[] = [
      // ===== DU AN (PROJECT) — theo khong gian =====
      {
        name: 'Phòng Khách',
        description: 'Thiết kế phòng khách hiện đại, tân cổ điển, tối giản',
        type: CategoryType.PROJECT, display_order: 1,
      },
      {
        name: 'Phòng Ngủ',
        description: 'Không gian phòng ngủ ấm cúng, thư giãn',
        type: CategoryType.PROJECT, display_order: 2,
      },
      {
        name: 'Phòng Bếp',
        description: 'Thiết kế nhà bếp tiện nghi, tối ưu công năng',
        type: CategoryType.PROJECT, display_order: 3,
      },
      {
        name: 'Phòng Tắm',
        description: 'Phòng tắm sang trọng, spa tại gia',
        type: CategoryType.PROJECT, display_order: 4,
      },
      {
        name: 'Phòng Ăn',
        description: 'Không gian ăn uống gia đình, tiếp khách',
        type: CategoryType.PROJECT, display_order: 5,
      },
      {
        name: 'Phòng Làm Việc',
        description: 'Home office, phòng đọc sách, góc làm việc',
        type: CategoryType.PROJECT, display_order: 6,
      },
      {
        name: 'Căn Hộ Chung Cư',
        description: 'Thiết kế nội thất căn hộ chung cư trọn gói',
        type: CategoryType.PROJECT, display_order: 7,
      },
      {
        name: 'Nhà Phố',
        description: 'Nội thất nhà phố, nhà liền kề',
        type: CategoryType.PROJECT, display_order: 8,
      },
      {
        name: 'Biệt Thự',
        description: 'Thiết kế biệt thự cao cấp, villa nghỉ dưỡng',
        type: CategoryType.PROJECT, display_order: 9,
      },
      {
        name: 'Văn Phòng',
        description: 'Không gian văn phòng làm việc chuyên nghiệp',
        type: CategoryType.PROJECT, display_order: 10,
      },
      {
        name: 'Showroom',
        description: 'Showroom trưng bày, cửa hàng thương mại',
        type: CategoryType.PROJECT, display_order: 11,
      },
      {
        name: 'Khách Sạn & Resort',
        description: 'Nội thất khách sạn, resort, homestay',
        type: CategoryType.PROJECT, display_order: 12,
      },
      {
        name: 'Nhà Hàng & Café',
        description: 'Thiết kế nhà hàng, quán café, bar lounge',
        type: CategoryType.PROJECT, display_order: 13,
      },

      // ===== SAN PHAM (PRODUCT) — co danh muc con =====
      {
        name: 'Sofa & Ghế Sofa',
        description: 'Sofa góc, sofa văng, sofa bed, ghế thư giãn',
        type: CategoryType.PRODUCT, display_order: 1,
        children: [
          { name: 'Sofa Góc', display_order: 1 },
          { name: 'Sofa Văng', display_order: 2 },
          { name: 'Sofa Bed', display_order: 3 },
          { name: 'Ghế Thư Giãn', display_order: 4 },
        ],
      },
      {
        name: 'Bàn',
        description: 'Bàn ăn, bàn trà, bàn làm việc, bàn trang điểm',
        type: CategoryType.PRODUCT, display_order: 2,
        children: [
          { name: 'Bàn Ăn', display_order: 1 },
          { name: 'Bàn Trà', display_order: 2 },
          { name: 'Bàn Làm Việc', display_order: 3 },
          { name: 'Bàn Trang Điểm', display_order: 4 },
          { name: 'Bàn Console', display_order: 5 },
        ],
      },
      {
        name: 'Ghế',
        description: 'Ghế ăn, ghế văn phòng, ghế bar, ghế accent',
        type: CategoryType.PRODUCT, display_order: 3,
        children: [
          { name: 'Ghế Ăn', display_order: 1 },
          { name: 'Ghế Văn Phòng', display_order: 2 },
          { name: 'Ghế Bar', display_order: 3 },
          { name: 'Ghế Accent', display_order: 4 },
        ],
      },
      {
        name: 'Giường Ngủ',
        description: 'Giường ngủ gỗ, giường bọc da, giường tầng',
        type: CategoryType.PRODUCT, display_order: 4,
        children: [
          { name: 'Giường Gỗ', display_order: 1 },
          { name: 'Giường Bọc Nệm', display_order: 2 },
          { name: 'Giường Tầng', display_order: 3 },
        ],
      },
      {
        name: 'Tủ & Kệ',
        description: 'Tủ quần áo, tủ giày, kệ sách, kệ TV, tủ bếp',
        type: CategoryType.PRODUCT, display_order: 5,
        children: [
          { name: 'Tủ Quần Áo', display_order: 1 },
          { name: 'Tủ Giày', display_order: 2 },
          { name: 'Tủ Bếp', display_order: 3 },
          { name: 'Kệ Sách', display_order: 4 },
          { name: 'Kệ TV & Trang Trí', display_order: 5 },
          { name: 'Tủ Rượu', display_order: 6 },
        ],
      },
      {
        name: 'Đèn Trang Trí',
        description: 'Đèn chùm, đèn bàn, đèn sàn, đèn tường',
        type: CategoryType.PRODUCT, display_order: 6,
        children: [
          { name: 'Đèn Chùm', display_order: 1 },
          { name: 'Đèn Bàn', display_order: 2 },
          { name: 'Đèn Sàn', display_order: 3 },
          { name: 'Đèn Tường', display_order: 4 },
          { name: 'Đèn Thả', display_order: 5 },
        ],
      },
      {
        name: 'Rèm Cửa & Thảm',
        description: 'Rèm vải, rèm gỗ, thảm trải sàn, thảm trang trí',
        type: CategoryType.PRODUCT, display_order: 7,
        children: [
          { name: 'Rèm Vải', display_order: 1 },
          { name: 'Rèm Gỗ & Sáo', display_order: 2 },
          { name: 'Thảm Trải Sàn', display_order: 3 },
        ],
      },
      {
        name: 'Phụ Kiện Trang Trí',
        description: 'Gương, tranh, bình hoa, đồ decor',
        type: CategoryType.PRODUCT, display_order: 8,
        children: [
          { name: 'Gương Trang Trí', display_order: 1 },
          { name: 'Tranh & Nghệ Thuật', display_order: 2 },
          { name: 'Bình Hoa & Chậu Cây', display_order: 3 },
          { name: 'Gối Tựa & Chăn', display_order: 4 },
          { name: 'Đồng Hồ Treo Tường', display_order: 5 },
        ],
      },

      // ===== BAI VIET (ARTICLE) =====
      {
        name: 'Xu Hướng Thiết Kế',
        description: 'Xu hướng nội thất mới nhất trong và ngoài nước',
        type: CategoryType.ARTICLE, display_order: 1,
      },
      {
        name: 'Kiến Thức Nội Thất',
        description: 'Hướng dẫn chọn nội thất, bố trí không gian',
        type: CategoryType.ARTICLE, display_order: 2,
      },
      {
        name: 'Phong Thủy Nhà Ở',
        description: 'Phong thủy phòng khách, phòng ngủ, bếp, cửa',
        type: CategoryType.ARTICLE, display_order: 3,
      },
      {
        name: 'Mẹo Trang Trí',
        description: 'Mẹo DIY, cách phối màu, bài trí không gian nhỏ',
        type: CategoryType.ARTICLE, display_order: 4,
      },
      {
        name: 'Vật Liệu & Chất Liệu',
        description: 'So sánh, đánh giá các loại gỗ, đá, vải, da',
        type: CategoryType.ARTICLE, display_order: 5,
      },
      {
        name: 'Câu Chuyện Dự Án',
        description: 'Chia sẻ quá trình thiết kế & thi công thực tế',
        type: CategoryType.ARTICLE, display_order: 6,
      },
      {
        name: 'Tư Vấn Mua Sắm',
        description: 'Gợi ý sản phẩm, so sánh giá, review đồ nội thất',
        type: CategoryType.ARTICLE, display_order: 7,
      },
      {
        name: 'Tin Tức & Sự Kiện',
        description: 'Tin tức công ty, triển lãm, khuyến mãi',
        type: CategoryType.ARTICLE, display_order: 8,
      },

      // ===== VAT LIEU (MATERIAL) =====
      {
        name: 'Gỗ Tự Nhiên',
        description: 'Gỗ óc chó, sồi, teak, ash, gỗ hương',
        type: CategoryType.MATERIAL, display_order: 1,
      },
      {
        name: 'Gỗ Công Nghiệp',
        description: 'MDF, HDF, MFC, Plywood, Melamine, Acrylic, Laminate',
        type: CategoryType.MATERIAL, display_order: 2,
      },
      {
        name: 'Đá Tự Nhiên & Nhân Tạo',
        description: 'Đá marble, granite, thạch anh, Caesarstone',
        type: CategoryType.MATERIAL, display_order: 3,
      },
      {
        name: 'Kim Loại',
        description: 'Inox, nhôm, sắt, đồng, mạ vàng',
        type: CategoryType.MATERIAL, display_order: 4,
      },
      {
        name: 'Kính',
        description: 'Kính cường lực, kính mờ, kính màu, gương',
        type: CategoryType.MATERIAL, display_order: 5,
      },
      {
        name: 'Vải & Da',
        description: 'Vải bố, nhung, lanh, da thật, da tổng hợp, simili',
        type: CategoryType.MATERIAL, display_order: 6,
      },
      {
        name: 'Sơn & Hoàn Thiện',
        description: 'Sơn tường, sơn gỗ, vecni, dầu lau, bả matit',
        type: CategoryType.MATERIAL, display_order: 7,
      },
    ];

    // Pass 1: tao tat ca danh muc goc (parent)
    const parentMap = new Map<string, string>(); // slug -> id
    const allEntities: Category[] = [];

    for (const item of seedData) {
      const slug = toSlug(item.name);
      const entity = this.categoryRepo.create({
        name: item.name,
        slug,
        description: item.description || null,
        type: item.type,
        display_order: item.display_order,
        is_active: true,
      });
      allEntities.push(entity);
    }

    const savedParents = await this.categoryRepo.save(allEntities);

    // Luu mapping slug -> id de gan parent_id cho children
    for (const parent of savedParents) {
      parentMap.set(parent.slug, parent.id);
    }

    // Pass 2: tao danh muc con (children)
    const childEntities: Category[] = [];

    for (const item of seedData) {
      if (!item.children?.length) continue;

      const parentSlug = toSlug(item.name);
      const parentId = parentMap.get(parentSlug);
      if (!parentId) continue;

      for (const child of item.children) {
        const entity = this.categoryRepo.create({
          name: child.name,
          slug: toSlug(child.name),
          description: child.description || null,
          type: item.type,
          parent_id: parentId,
          display_order: child.display_order,
          is_active: true,
        });
        childEntities.push(entity);
      }
    }

    if (childEntities.length > 0) {
      await this.categoryRepo.save(childEntities);
    }

    const total = savedParents.length + childEntities.length;
    this.actionLogger.log(
      `Seeded ${total} categories (${savedParents.length} parents + ${childEntities.length} children)`,
    );
    return { seeded: total };
  }
}
