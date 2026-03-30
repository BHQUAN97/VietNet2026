import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { Category, CategoryType } from '../projects/entities/category.entity';

const SITE_URL = 'https://bhquan.site';

@Controller()
export class SeoController {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  @Public()
  @Get('sitemap.xml')
  async sitemap(@Res() res: Response) {
    const [projects, products, categories] = await Promise.all([
      this.projectRepo.find({
        where: { status: ProjectStatus.PUBLISHED, deleted_at: IsNull() },
        select: ['slug', 'updated_at'],
        order: { updated_at: 'DESC' },
      }),
      this.productRepo.find({
        where: { status: ProductStatus.PUBLISHED, deleted_at: IsNull() },
        select: ['slug', 'updated_at'],
        order: { updated_at: 'DESC' },
      }),
      this.categoryRepo.find({
        where: { is_active: true, deleted_at: IsNull() },
        select: ['slug', 'type', 'updated_at'],
        order: { updated_at: 'DESC' },
      }),
    ]);

    // Filter out soft-deleted records (deleted_at IS NULL)
    const activeProjects = projects.filter((p) => !p.deleted_at);
    const activeProducts = products.filter((p) => !p.deleted_at);
    const activeCategories = categories.filter((c) => !c.deleted_at);

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/projects', priority: '0.9', changefreq: 'weekly' },
      { url: '/catalog', priority: '0.9', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    ];

    const now = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Projects
    for (const project of activeProjects) {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/projects/${project.slug}</loc>\n`;
      xml += `    <lastmod>${project.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    // Products
    for (const product of activeProducts) {
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}/catalog/${product.slug}</loc>\n`;
      xml += `    <lastmod>${product.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    // Categories
    for (const category of activeCategories) {
      const prefix =
        category.type === CategoryType.PROJECT ? '/projects' : '/catalog';
      xml += '  <url>\n';
      xml += `    <loc>${SITE_URL}${prefix}?category=${category.slug}</loc>\n`;
      xml += `    <lastmod>${category.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Public()
  @Get('robots.txt')
  robots(@Res() res: Response) {
    const content = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api',
      '',
      `Sitemap: ${SITE_URL}/sitemap.xml`,
    ].join('\n');

    res.set('Content-Type', 'text/plain');
    res.send(content);
  }
}
