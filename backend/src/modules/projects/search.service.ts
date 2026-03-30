import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { Article, ArticleStatus } from '../articles/entities/article.entity';

export interface SearchResult {
  id: string;
  type: 'project' | 'product' | 'article';
  title: string;
  slug: string;
  description: string | null;
  cover_image_id: string | null;
  updated_at: Date;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  async search(
    query: string,
    page: number,
    limit: number,
  ): Promise<{ data: SearchResult[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    if (!query || query.trim().length === 0) {
      return {
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const searchTerm = `%${query.trim()}%`;

    // Search published projects
    const [projects, projectCount] = await this.projectRepo
      .createQueryBuilder('p')
      .where('p.status = :status', { status: ProjectStatus.PUBLISHED })
      .andWhere('p.deleted_at IS NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where('p.title LIKE :search', { search: searchTerm })
            .orWhere('p.description LIKE :search', { search: searchTerm });
        }),
      )
      .orderBy(
        `CASE WHEN p.title LIKE :exactSearch THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('p.updated_at', 'DESC')
      .setParameter('exactSearch', searchTerm)
      .getManyAndCount();

    // Search published products
    const [products, productCount] = await this.productRepo
      .createQueryBuilder('pr')
      .where('pr.status = :status', { status: ProductStatus.PUBLISHED })
      .andWhere('pr.deleted_at IS NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where('pr.name LIKE :search', { search: searchTerm })
            .orWhere('pr.description LIKE :search', { search: searchTerm });
        }),
      )
      .orderBy(
        `CASE WHEN pr.name LIKE :exactSearch THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('pr.updated_at', 'DESC')
      .setParameter('exactSearch', searchTerm)
      .getManyAndCount();

    // Search published articles
    const [articles, articleCount] = await this.articleRepo
      .createQueryBuilder('ar')
      .where('ar.status = :status', { status: ArticleStatus.PUBLISHED })
      .andWhere('ar.deleted_at IS NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where('ar.title LIKE :search', { search: searchTerm })
            .orWhere('ar.excerpt LIKE :search', { search: searchTerm });
        }),
      )
      .orderBy(
        `CASE WHEN ar.title LIKE :exactSearch THEN 0 ELSE 1 END`,
        'ASC',
      )
      .addOrderBy('ar.updated_at', 'DESC')
      .setParameter('exactSearch', searchTerm)
      .getManyAndCount();

    // Combine results
    const combined: SearchResult[] = [
      ...projects.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.title,
        slug: p.slug,
        description: p.description,
        cover_image_id: p.cover_image_id,
        updated_at: p.updated_at,
      })),
      ...products.map((pr) => ({
        id: pr.id,
        type: 'product' as const,
        title: pr.name,
        slug: pr.slug,
        description: pr.description,
        cover_image_id: pr.cover_image_id,
        updated_at: pr.updated_at,
      })),
      ...articles.map((ar) => ({
        id: ar.id,
        type: 'article' as const,
        title: ar.title,
        slug: ar.slug,
        description: ar.excerpt,
        cover_image_id: ar.cover_image_id,
        updated_at: ar.updated_at,
      })),
    ];

    // Sort combined: exact title matches first, then by updated_at desc
    const lowerQuery = query.trim().toLowerCase();
    combined.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      const bExact = b.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return b.updated_at.getTime() - a.updated_at.getTime();
    });

    const total = projectCount + productCount + articleCount;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination to combined results
    const start = (page - 1) * limit;
    const paginated = combined.slice(start, start + limit);

    return {
      data: paginated,
      meta: { page, limit, total, totalPages },
    };
  }
}
