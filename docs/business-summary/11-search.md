# 11. Global Search

> Module: A8 (Search) | Features: A8.1-A8.3
> Priority: P1 | Status: Spec Done

---

## Summary

Tim kiem full-text tren toan bo projects va products. User go tu khoa → ket qua hon hop (projects + products) hien thi tuc thi. Su dung MySQL FULLTEXT index tren title/name + description. FE debounce 300ms, hien thi ket qua voi highlight matched terms.

---

## Workflow

### Search Flow
```
User go tu khoa vao search bar:
  → [1] FE debounce 300ms
  → [2] GET /api/search?q=tu+bep+go&type=all&limit=10
  → [3] MySQL FULLTEXT search:
      - projects: WHERE MATCH(title, description) AGAINST(?)
      - products: WHERE MATCH(name, description) AGAINST(?)
      - Chi published, non-deleted
  → [4] Tra ket qua:
      - projects[]: id, title, slug, description (truncated, <mark> highlight)
      - products[]: id, name, slug, description, material_type
      - total counts
  → [5] FE hien thi mixed results
  → [6] Neu khong co ket qua: "Khong tim thay ket qua" + goi y
```

---

## Giai phap chi tiet

### API Endpoint

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/search` | @Public | Full-text search |

### Query Parameters

| Param | Type | Default | Mo ta |
|-------|------|---------|-------|
| q | string | required | Min 2 chars |
| type | enum | 'all' | 'all', 'projects', 'products' |
| page | number | 1 | — |
| limit | number | 10 | Max 50. Khi type='all': 5 projects + 5 products |

### Response Structure

```typescript
{
  success: true,
  data: {
    projects: [{ id, title, slug, description, category, cover_image, type: 'project' }],
    products: [{ id, name, slug, description, material_type, cover_image, type: 'product' }],
    total_projects: number,
    total_products: number
  },
  meta: { page, limit, total, totalPages }
}
```

### UX

- Autocomplete dropdown khi user go
- Mixed results: projects va products tach rieng
- Description truncated voi `<mark>` quanh matched terms
- No results: empty state voi goi y thay doi tu khoa
- Debounce 300ms phia FE

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Projects + Products tables da co FULLTEXT INDEX tren title/name + description

### File Structure

```
backend/src/modules/projects/
└── search.service.ts            # Da co, su dung FULLTEXT

frontend/src/
├── app/(public)/search/page.tsx # Search results page
└── components/SearchBar.tsx     # Autocomplete dropdown
```

### Thu tu implement (Backend)

**Buoc 1: Ensure FULLTEXT Indexes (migration)**
```sql
ALTER TABLE projects ADD FULLTEXT INDEX ft_projects_search (title, description);
ALTER TABLE products ADD FULLTEXT INDEX ft_products_search (name, description);
```

**Buoc 2: Search Service**
```typescript
@Injectable()
export class SearchService {
  async search(q: string, type: 'all' | 'projects' | 'products', page: number, limit: number) {
    const results: any = { projects: [], products: [], total_projects: 0, total_products: 0 };
    const perType = type === 'all' ? Math.floor(limit / 2) : limit;

    if (type === 'all' || type === 'projects') {
      const [items, total] = await this.projectRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'c')
        .leftJoinAndSelect('p.coverImage', 'img')
        .where('p.status = :status', { status: 'published' })
        .andWhere('p.deleted_at IS NULL')
        .andWhere('MATCH(p.title, p.description) AGAINST(:q IN BOOLEAN MODE)', { q })
        .take(perType)
        .skip((page - 1) * perType)
        .getManyAndCount();
      results.projects = items.map(p => ({ ...p, type: 'project' }));
      results.total_projects = total;
    }

    if (type === 'all' || type === 'products') {
      // Tuong tu cho products
    }

    return results;
  }
}
```

**Buoc 3: Controller**
```
GET /search?q=xxx&type=all&page=1&limit=10: @Public()
  - Validate: q min 2 chars
  - Call searchService.search()
```

### Frontend Implementation

```
SearchBar.tsx:
  - Input voi useDebounce(300ms)
  - Khi user go >= 2 chars: GET /search?q=xxx&type=all&limit=5
  - Dropdown: projects section + products section
  - Click result → navigate to /projects/{slug} hoac /catalog/{slug}
  - Enter → navigate to /search?q=xxx (full results page)

/search/page.tsx:
  - Read q tu searchParams
  - Fetch: GET /search?q=xxx&page=1&limit=10
  - Render 2 sections: Projects (cards) + Products (cards)
  - Pagination
  - Empty state: "Khong tim thay ket qua cho '[q]'"
```

### Testing Checklist

- [ ] Search "tu bep" → tra products va projects co chua "tu bep"
- [ ] q < 2 chars → 400
- [ ] Chi tra published, non-deleted records
- [ ] type=projects → chi tra projects
- [ ] Pagination hoat dong dung
