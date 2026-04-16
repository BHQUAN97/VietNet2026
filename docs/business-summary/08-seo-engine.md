# 08. SEO Engine

> Module: C4 (SEO) + A4.6 (Project SEO) + B8.2 (SEO Settings)
> Priority: P0 | Status: Spec Done

---

## Summary

He thong SEO toan dien nham dat diem PageSpeed 90+ Mobile. Bao gom: dynamic sitemap, JSON-LD structured data, Open Graph meta tags, canonical URLs, robots.txt. Moi trang public co meta tags rieng, tuy chinh duoc tu admin. Toan bo public pages render SSR (Server-Side Rendering) qua Next.js App Router de Google bot doc duoc.

---

## Workflow

### Page Rendering (SSR)
```
Google bot / User truy cap:
  → [1] Next.js App Router render page server-side
  → [2] generateMetadata() tao meta tags tu API data:
      - title: "[Ten] | VietNet Interior"
      - description: 160 chars dau cua content
      - og:title, og:description, og:image, og:url
      - twitter:card=summary_large_image
  → [3] JSON-LD inject vao <head>
  → [4] HTML tra ve day du cho bot index
```

### Sitemap Generation
```
GET /api/sitemap.xml:
  → [1] Check Redis cache (TTL 1h)
  → [2] Neu miss: query all published projects + products
  → [3] Generate XML sitemap:
      - Homepage: priority 1.0, changefreq weekly
      - Projects: priority 0.8, changefreq monthly
      - Products: priority 0.7
      - Static pages: /about, /contact, /catalog
  → [4] Cache vao Redis
  → [5] Tra Content-Type: application/xml
```

### Cache Invalidation
```
Khi publish/unpublish project hoac product:
  → DEL cache:sitemap
  → revalidatePath() cho ISR
```

---

## Giai phap chi tiet

### API Endpoints

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/sitemap.xml` | @Public | Dynamic XML sitemap |
| GET | `/api/robots.txt` | @Public | Robots.txt |
| GET | `/api/settings/seo` | @Admin | SEO settings |
| PUT | `/api/settings/seo` | @Admin | Update SEO defaults |

### Meta Tags per Page

| Page | Title | JSON-LD Type |
|------|-------|-------------|
| Homepage | "VietNet Interior Design" | Organization |
| Project Detail | "[Title] \| VietNet" | Article |
| Product Detail | "[Name] \| VietNet" | Product |
| Catalog | "Danh Muc Tu Bep \| VietNet" | CollectionPage |
| About | "Ve VietNet \| VietNet" | AboutPage |
| Contact | "Lien He \| VietNet" | ContactPage |

### robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /preview

Sitemap: https://bhquan.site/api/sitemap.xml
```

### SEO Settings (Admin Configurable)

| Setting | Default |
|---------|---------|
| site_title | "VietNet Interior Design" |
| title_template | "{page} \| VietNet Interior" |
| default_meta_description | "VietNet Interior - Thiet ke noi that cao cap..." |
| default_og_image_url | null (can upload) |
| canonical_base_url | "https://bhquan.site" |
| google_analytics_id | "" |

### ISR Strategy (Next.js)

| Page Type | Revalidate | On-demand |
|-----------|-----------|-----------|
| Homepage | 60s | revalidatePath('/') on publish |
| Project Detail | 3600s (1h) | revalidatePath('/projects/[slug]') |
| Product Detail | 3600s | revalidatePath('/catalog/[slug]') |
| Category Listing | 300s (5min) | revalidatePath('/projects') |

### Performance Targets

- PageSpeed Mobile: 90+
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- FID (First Input Delay): < 100ms

### Techniques

- next/image: WebP, responsive srcSet, lazy load
- next/font: font-display swap, preload
- Critical CSS inlining (Next.js built-in)
- Preconnect to R2 CDN domain
- Blur placeholder (blurhash) cho images
- Gzip + Brotli compression (Nginx)
- Micro-caching 1s (Nginx) cho public GET

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- CMS module (projects, products) da hoan thanh — sitemap can list published content
- Settings module da co (SEO defaults)

### File Structure

```
backend/src/modules/seo/
└── (khong can module rieng — endpoints nam trong pages/settings controller)

frontend/src/
├── app/robots.ts                # Dynamic robots.txt
├── app/sitemap.ts               # Dynamic sitemap.xml
├── lib/seo-helpers.ts           # buildMeta(), buildOgTags()
├── lib/jsonld.ts                # generateArticleLD, generateProductLD, generateOrgLD
└── app/(public)/
    ├── page.tsx                 # generateMetadata + JSON-LD Organization
    ├── projects/[slug]/page.tsx # generateMetadata + JSON-LD Article
    ├── catalog/[slug]/page.tsx  # generateMetadata + JSON-LD Product
    └── layout.tsx               # Default metadata
```

### Thu tu implement

**Buoc 1: Dynamic Metadata (Next.js generateMetadata)**
```typescript
// app/(public)/projects/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await serverFetch(`/projects/slug/${params.slug}`);
  return {
    title: project.seo_title || `${project.title} | VietNet Interior`,
    description: project.seo_description || project.description?.substring(0, 160),
    openGraph: {
      title: project.title,
      description: project.description?.substring(0, 200),
      images: [{ url: project.cover_image?.desktop_url, width: 1200, height: 630 }],
      url: `https://bhquan.site/projects/${project.slug}`,
      type: 'article',
    },
    alternates: { canonical: `https://bhquan.site/projects/${project.slug}` },
  };
}
```

**Buoc 2: JSON-LD Structured Data**
```typescript
// lib/jsonld.ts
export function generateArticleLD(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    name: project.title,
    description: project.description,
    image: project.cover_image?.desktop_url,
    datePublished: project.published_at,
    dateModified: project.updated_at,
    author: { '@type': 'Organization', name: 'VietNet Interior' },
    publisher: { '@type': 'Organization', name: 'VietNet Interior' },
  };
}

// Su dung trong page:
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(generateArticleLD(project)) }}
/>
```

**Buoc 3: Dynamic Sitemap**
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, products] = await Promise.all([
    serverFetch('/projects?limit=1000'),
    serverFetch('/products?limit=1000'),
  ]);

  const staticPages = [
    { url: 'https://bhquan.site', changeFrequency: 'weekly', priority: 1.0 },
    { url: 'https://bhquan.site/about', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://bhquan.site/contact', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://bhquan.site/catalog', changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://bhquan.site/projects', changeFrequency: 'weekly', priority: 0.8 },
  ];

  const projectPages = projects.data.map(p => ({
    url: `https://bhquan.site/projects/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const productPages = products.data.map(p => ({
    url: `https://bhquan.site/catalog/${p.slug}`,
    lastModified: p.updated_at,
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages, ...productPages];
}
```

**Buoc 4: Robots.txt**
```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/preview'] },
    sitemap: 'https://bhquan.site/sitemap.xml',
  };
}
```

**Buoc 5: ISR Revalidation**
```typescript
// app/api/revalidate/route.ts
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.REVALIDATE_SECRET) return Response.json({}, { status: 401 });

  const path = req.nextUrl.searchParams.get('path') || '/';
  revalidatePath(path);
  return Response.json({ revalidated: true });
}

// Backend goi sau moi publish/update:
// await fetch(`${NEXT_REVALIDATE_URL}/api/revalidate?secret=XXX&path=/projects/${slug}`)
```

### Testing Checklist

- [ ] Moi trang public co <title>, <meta description> dung
- [ ] OG tags: og:title, og:description, og:image render dung
- [ ] JSON-LD: valid schema (dung Google Structured Data Testing Tool)
- [ ] Sitemap.xml: list tat ca published projects + products
- [ ] Robots.txt: disallow /admin/, /api/
- [ ] ISR revalidate: sau publish → trang cap nhat ngay
- [ ] PageSpeed Mobile: target 90+
