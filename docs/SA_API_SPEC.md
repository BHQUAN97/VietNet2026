# SA_API_SPEC -- API Endpoints VietNet Interior

> **Version:** 1.0 | **Status:** SA_DONE
> **Tech:** NestJS + TypeScript | **Base URL:** `/api`
> **Date:** 2026-03-27
> **Author:** Agent_SA

---

## CONVENTIONS

| Convention | Detail |
|---|---|
| **Response format** | `{ success: boolean, data: T \| null, message: string, meta?: { page: number, limit: number, total: number, totalPages: number } }` |
| **Auth** | JWT in HttpOnly cookies. `access_token` (60 min) + `refresh_token` (7 days, Secure, SameSite=Strict) |
| **Guards** | `@Public` (no auth), `@Auth` (logged in), `@Admin` (role=admin), `@Editor` (role=editor) |
| **Validation** | class-validator DTOs on all request bodies |
| **Pagination** | Query: `?page=1&limit=20` -> meta in response |
| **Sorting** | Query: `?sort=created_at&order=desc` |
| **Soft delete** | All records have `deleted_at: Date \| null`, never physically removed |
| **IDs** | ULID for all primary keys (26 chars, Crockford Base32) |
| **Timestamps** | ISO 8601 strings in responses. DB stores `DATETIME` |
| **Error format** | `{ success: false, data: null, message: string, errors?: Record<string, string[]> }` |

---

# GROUP 1: AUTH (`/api/auth`)

## POST /api/auth/login

- **Guard:** @Public
- **Rate limit:** 5 failed attempts / 10 min per IP. After 5 failures, block IP for 30 min.
- **Description:** Authenticate admin user. Sets HttpOnly cookies for access and refresh tokens.

**Request body:**
```typescript
{
  email: string;       // required, valid email format
  password: string;    // required, min 8 chars
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;          // ULID
      name: string;
      email: string;
      role: 'admin' | 'editor';
      avatar_url: string | null;
      created_at: string;
    }
  },
  message: "Login successful"
}
// Sets cookies: access_token (60min), refresh_token (7d, HttpOnly, Secure, SameSite=Strict)
```

**Response 401:**
```typescript
{
  success: false,
  data: null,
  message: "Invalid email or password"
  // Do NOT reveal which field is wrong
}
```

**Response 429:**
```typescript
{
  success: false,
  data: null,
  message: "Too many login attempts. Try again in 30 minutes."
}
```

**Notes:**
- Password checked with bcrypt (cost 12)
- CSRF token returned in response header `X-CSRF-Token`
- Remaining attempts returned in header `X-RateLimit-Remaining`
- Ref: BA B1.1

---

## POST /api/auth/refresh

- **Guard:** @Public (refresh token in cookie)
- **Description:** Exchange valid refresh token for new access token.

**Request:** No body. Refresh token read from HttpOnly cookie.

**Response 200:**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'editor';
    }
  },
  message: "Token refreshed"
}
// Sets new access_token cookie (60min)
```

**Response 401:**
```typescript
{
  success: false,
  data: null,
  message: "Invalid or expired refresh token"
}
```

**Notes:**
- Refresh token rotation: old refresh token invalidated, new one issued
- Ref: BA B1.3

---

## POST /api/auth/logout

- **Guard:** @Auth
- **Description:** Clear auth cookies and revoke refresh token server-side.

**Request:** No body. Tokens read from cookies.

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Logged out successfully"
}
// Clears cookies: access_token, refresh_token
```

**Notes:**
- Refresh token added to revocation list in Redis (TTL = remaining token lifetime)
- Ref: BA B1.3

---

## POST /api/auth/forgot-password

- **Guard:** @Public
- **Rate limit:** 3 requests / hour per email
- **Description:** Send password reset link via email (Resend API).

**Request body:**
```typescript
{
  email: string;    // required, valid email format
}
```

**Response 200 (always, whether email exists or not):**
```typescript
{
  success: true,
  data: null,
  message: "If this email exists, a reset link has been sent."
}
```

**Notes:**
- Reset token: crypto random 64 chars, stored hashed in DB, expires in 1 hour, single use
- Email sent via BullMQ MAIL_JOB -> Resend API
- Security: same response whether email exists or not (prevents enumeration)
- Ref: BA B1.2

---

## POST /api/auth/reset-password

- **Guard:** @Public
- **Description:** Reset password using token from email link.

**Request body:**
```typescript
{
  token: string;           // required, reset token from email link
  new_password: string;    // required, min 8 chars, 1 uppercase, 1 number, 1 special char
}
```

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Password reset successful. Please login with your new password."
}
```

**Response 400:**
```typescript
{
  success: false,
  data: null,
  message: "Invalid or expired reset token"
}
```

**Notes:**
- Token validated: exists, not expired (1h), not used
- After reset: token marked as used, all existing refresh tokens for user revoked
- Password hashed with bcrypt (cost 12)
- Ref: BA B1.2

---

## GET /api/auth/me

- **Guard:** @Auth
- **Description:** Get current authenticated user profile.

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor';
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  },
  message: "OK"
}
```

---

# GROUP 2: PROJECTS (`/api/projects`)

## GET /api/projects

- **Guard:** @Public
- **Description:** List published projects with pagination and filters.

**Query params:**
```typescript
{
  page?: number;            // default 1
  limit?: number;           // default 12, max 50
  category?: string;        // category slug filter
  style?: string;           // design style filter
  sort?: 'created_at' | 'title';   // default 'created_at'
  order?: 'asc' | 'desc';  // default 'desc'
  q?: string;               // search by title
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;         // truncated to 200 chars
    category: {
      id: string;
      name: string;
      slug: string;
    };
    style: string | null;
    area: number | null;          // square meters
    cover_image: {
      id: string;
      thumbnail_url: string;     // 768px WebP
      desktop_url: string;       // 2048px WebP
      alt: string;
    } | null;
    status: 'published';
    created_at: string;
    updated_at: string;
  }>,
  message: "OK",
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

**Notes:**
- Only returns `status = 'published'` and `deleted_at IS NULL`
- Cover image is first image in gallery (order = 0) or explicitly set
- Ref: BA A2.3, A3.4, A3.7

---

## GET /api/projects/:id

- **Guard:** @Public
- **Description:** Get single project with full details and gallery images.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    title: string;
    slug: string;
    description: string;           // full rich text (HTML)
    category: {
      id: string;
      name: string;
      slug: string;
    };
    style: string | null;
    materials: string | null;       // comma-separated or JSON array
    area: number | null;
    location: string | null;
    year_completed: number | null;
    cover_image: {
      id: string;
      thumbnail_url: string;
      desktop_url: string;
      alt: string;
    } | null;
    gallery: Array<{
      id: string;
      media_id: string;
      thumbnail_url: string;
      desktop_url: string;
      alt: string;
      order: number;
    }>;
    seo_title: string | null;
    seo_description: string | null;
    og_image_url: string | null;
    status: 'published';
    created_at: string;
    updated_at: string;
  },
  message: "OK"
}
```

**Response 404:**
```typescript
{
  success: false,
  data: null,
  message: "Project not found"
}
```

**Notes:**
- Returns 404 if project is draft or deleted (public cannot see)
- Gallery sorted by `order` ASC
- Ref: BA A4.1, A4.2, A4.3

---

## GET /api/projects/slug/:slug

- **Guard:** @Public
- **Description:** Get project by SEO-friendly slug. Same response as GET /api/projects/:id.

**Params:** `slug` -- URL-safe string

**Response:** Same as GET /api/projects/:id

**Notes:**
- Primary lookup for public pages (SEO-friendly URLs)
- Ref: BA A4.6

---

## POST /api/projects

- **Guard:** @Admin
- **Description:** Create a new project.

**Request body:**
```typescript
{
  title: string;                    // required, max 200 chars
  description: string;              // required, rich text HTML
  category_id: string;              // required, ULID
  style?: string;                   // e.g. "Modern", "Classic", "Minimalist"
  materials?: string;               // e.g. "Oak, Marble, Brass"
  area?: number;                    // square meters
  location?: string;
  year_completed?: number;
  slug?: string;                    // auto-generated from title if empty
  seo_title?: string;               // max 60 chars
  seo_description?: string;         // max 160 chars
  og_image_id?: string;             // ULID of media
  status?: 'draft' | 'published';   // default 'draft'
  is_featured?: boolean;            // default false
}
```

**Response 201:**
```typescript
{
  success: true,
  data: {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    created_at: string;
  },
  message: "Project created successfully"
}
```

**Response 400:**
```typescript
{
  success: false,
  data: null,
  message: "Validation failed",
  errors: {
    title: ["Title is required"],
    category_id: ["Invalid category"]
  }
}
```

**Response 409:**
```typescript
{
  success: false,
  data: null,
  message: "Slug already exists"
}
```

**Notes:**
- Slug auto-generation: remove Vietnamese diacritics, lowercase, replace spaces with dashes
- Slug uniqueness validated
- Ref: BA B3.2, B3.6

---

## PUT /api/projects/:id

- **Guard:** @Admin
- **Description:** Update an existing project.

**Params:** `id` -- ULID

**Request body:** Same fields as POST (all optional, partial update).

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    updated_at: string;
  },
  message: "Project updated successfully"
}
```

**Response 404:** Project not found.

**Notes:**
- Ref: BA B3.2, B3.3

---

## DELETE /api/projects/:id

- **Guard:** @Admin
- **Description:** Soft delete a project.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Project deleted successfully"
}
```

**Response 404:** Project not found.

**Notes:**
- Sets `deleted_at = NOW()`, does not physically remove
- Published projects require confirmation (handled by FE)
- Ref: BA B3.2

---

## GET /api/projects/:id/gallery

- **Guard:** @Public
- **Description:** Get all gallery images for a project, ordered.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;            // gallery_item id
    media_id: string;
    original_url: string;
    thumbnail_url: string;  // 768px WebP
    desktop_url: string;    // 2048px WebP
    alt: string;
    order: number;
  }>,
  message: "OK"
}
```

**Notes:**
- Sorted by `order` ASC
- Ref: BA A4.3

---

## POST /api/projects/:id/gallery

- **Guard:** @Admin
- **Description:** Add images to project gallery.

**Params:** `id` -- ULID

**Request body:**
```typescript
{
  images: Array<{
    media_id: string;    // ULID of existing media
    alt?: string;
    order: number;       // display order (0-based)
  }>;
}
```

**Response 201:**
```typescript
{
  success: true,
  data: {
    added: number;    // count of images added
  },
  message: "Images added to gallery"
}
```

**Notes:**
- Media must already be uploaded via /api/media/upload
- Ref: BA B3.5

---

## PUT /api/projects/:id/gallery/reorder

- **Guard:** @Admin
- **Description:** Reorder gallery images via drag-and-drop.

**Params:** `id` -- ULID

**Request body:**
```typescript
{
  order: Array<{
    id: string;       // gallery_item id
    order: number;    // new order (0-based)
  }>;
}
```

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Gallery reordered"
}
```

**Notes:**
- Ref: BA B3.5

---

## DELETE /api/projects/:id/gallery/:imageId

- **Guard:** @Admin
- **Description:** Remove an image from project gallery.

**Params:** `id` -- project ULID, `imageId` -- gallery_item ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Image removed from gallery"
}
```

**Notes:**
- Removes gallery association only. Media file is NOT deleted.
- Ref: BA B3.5

---

## GET /api/projects/related/:id

- **Guard:** @Public
- **Description:** Get related projects (same category, excluding current).

**Params:** `id` -- ULID
**Query:** `limit?: number` (default 3, max 6)

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    title: string;
    slug: string;
    category: { id: string; name: string; slug: string; };
    cover_image: {
      thumbnail_url: string;
      desktop_url: string;
      alt: string;
    } | null;
  }>,
  message: "OK"
}
```

**Notes:**
- Same category first, then same style, then random published
- Only published, non-deleted
- Ref: BA A4.4

---

## GET /api/projects/featured

- **Guard:** @Public
- **Description:** Get featured projects for homepage display.

**Query:** `limit?: number` (default 6, max 6)

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    title: string;
    slug: string;
    category: { id: string; name: string; slug: string; };
    style: string | null;
    cover_image: {
      thumbnail_url: string;
      desktop_url: string;
      alt: string;
    } | null;
  }>,
  message: "OK"
}
```

**Notes:**
- Returns projects where `is_featured = true` and `status = 'published'`
- Sorted by `featured_order` ASC, then `created_at` DESC
- Ref: BA A2.3

---

# GROUP 3: CATEGORIES (`/api/categories`)

## GET /api/categories

- **Guard:** @Public
- **Description:** List all active categories.

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    project_count: number;       // count of published projects
    created_at: string;
  }>,
  message: "OK"
}
```

**Notes:**
- Only returns categories where `deleted_at IS NULL`
- `project_count` computed from published, non-deleted projects
- Ref: BA B3.4

---

## POST /api/categories

- **Guard:** @Admin
- **Description:** Create a new category.

**Request body:**
```typescript
{
  name: string;            // required, max 100 chars
  slug?: string;           // auto-generated from name if empty
  description?: string;    // max 500 chars
}
```

**Response 201:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
  },
  message: "Category created successfully"
}
```

**Response 409:** Slug already exists.

**Notes:**
- Default categories: Residential, Commercial, Hospitality
- Ref: BA B3.4

---

## PUT /api/categories/:id

- **Guard:** @Admin
- **Description:** Update a category.

**Params:** `id` -- ULID

**Request body:**
```typescript
{
  name?: string;
  slug?: string;
  description?: string;
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    updated_at: string;
  },
  message: "Category updated successfully"
}
```

---

## DELETE /api/categories/:id

- **Guard:** @Admin
- **Description:** Soft delete a category.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Category deleted successfully"
}
```

**Response 409:**
```typescript
{
  success: false,
  data: null,
  message: "Cannot delete category with existing projects. Reassign projects first."
}
```

**Notes:**
- Cannot delete if published projects reference this category
- Ref: BA B3.4

---

# GROUP 4: PRODUCTS (`/api/products`)

## GET /api/products

- **Guard:** @Public
- **Description:** List products with pagination and filters.

**Query params:**
```typescript
{
  page?: number;                    // default 1
  limit?: number;                   // default 9 (desktop), max 50
  material_type?: string;           // e.g. 'industrial-wood', 'natural-wood', 'acrylic', 'melamine', 'glass'
  finish?: string;                  // surface finish filter
  category_id?: string;             // ULID
  sort?: 'created_at' | 'name' | 'price_range';
  order?: 'asc' | 'desc';
  q?: string;                       // search by name
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;            // truncated to 150 chars
    material_type: string;
    finish: string | null;
    price_range: string | null;     // e.g. "15,000,000 - 25,000,000 VND"
    rating: number | null;          // average rating 0-5
    is_new: boolean;                // created within last 30 days
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    cover_image: {
      id: string;
      thumbnail_url: string;
      desktop_url: string;
      alt: string;
    } | null;
    created_at: string;
  }>,
  message: "OK",
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

**Notes:**
- `is_new` computed: `created_at > NOW() - 30 days`
- Only returns non-deleted products
- material_type values: `industrial-wood`, `natural-wood`, `glass`, `acrylic`, `melamine`
- Ref: BA A3.1, A3.3, A3.4, A3.6, A3.7

---

## GET /api/products/:id

- **Guard:** @Public
- **Description:** Get single product with full details.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    slug: string;
    description: string;             // full rich text HTML
    material_type: string;
    finish: string | null;
    dimensions: {
      width: number | null;          // cm
      height: number | null;         // cm
      depth: number | null;          // cm
    } | null;
    price_range: string | null;
    rating: number | null;
    is_new: boolean;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    material_specs: {
      origin: string | null;         // e.g. "European imported"
      durability_years: number | null;
      maintenance: string | null;
      available_colors: Array<{
        name: string;
        hex: string;
        image_url: string | null;
      }>;
    } | null;
    images: Array<{
      id: string;
      media_id: string;
      thumbnail_url: string;
      desktop_url: string;
      alt: string;
      order: number;
    }>;
    seo_title: string | null;
    seo_description: string | null;
    og_image_url: string | null;
    created_at: string;
    updated_at: string;
  },
  message: "OK"
}
```

**Response 404:** Product not found.

**Notes:**
- Ref: BA A5.1, A5.2, A5.3

---

## GET /api/products/slug/:slug

- **Guard:** @Public
- **Description:** Get product by SEO-friendly slug. Same response as GET /api/products/:id.

**Params:** `slug` -- URL-safe string

---

## POST /api/products

- **Guard:** @Admin
- **Description:** Create a new product.

**Request body:**
```typescript
{
  name: string;                     // required, max 200 chars
  description: string;              // required, rich text HTML
  material_type: string;            // required
  finish?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  price_range?: string;
  category_id?: string;             // ULID
  slug?: string;                    // auto-generated from name if empty
  seo_title?: string;               // max 60 chars
  seo_description?: string;         // max 160 chars
  og_image_id?: string;             // ULID
  material_specs?: {
    origin?: string;
    durability_years?: number;
    maintenance?: string;
    available_colors?: Array<{
      name: string;
      hex: string;
      image_url?: string;
    }>;
  };
}
```

**Response 201:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
  },
  message: "Product created successfully"
}
```

**Response 409:** Slug already exists.

---

## PUT /api/products/:id

- **Guard:** @Admin
- **Description:** Update a product.

**Params:** `id` -- ULID
**Request body:** Same fields as POST (all optional, partial update).

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    slug: string;
    updated_at: string;
  },
  message: "Product updated successfully"
}
```

---

## DELETE /api/products/:id

- **Guard:** @Admin
- **Description:** Soft delete a product.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Product deleted successfully"
}
```

---

## GET /api/products/:id/images

- **Guard:** @Public
- **Description:** Get product images.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    media_id: string;
    original_url: string;
    thumbnail_url: string;
    desktop_url: string;
    alt: string;
    order: number;
  }>,
  message: "OK"
}
```

---

## POST /api/products/:id/images

- **Guard:** @Admin
- **Description:** Add images to a product.

**Params:** `id` -- ULID

**Request body:**
```typescript
{
  images: Array<{
    media_id: string;     // ULID of existing media
    alt?: string;
    order: number;
  }>;
}
```

**Response 201:**
```typescript
{
  success: true,
  data: { added: number; },
  message: "Images added to product"
}
```

---

## DELETE /api/products/:id/images/:imageId

- **Guard:** @Admin
- **Description:** Remove an image from a product.

**Params:** `id` -- product ULID, `imageId` -- product_image ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Image removed from product"
}
```

---

## GET /api/products/related/:id

- **Guard:** @Public
- **Description:** Get related products (same material type or category).

**Params:** `id` -- ULID
**Query:** `limit?: number` (default 4, max 8)

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    name: string;
    slug: string;
    material_type: string;
    price_range: string | null;
    is_new: boolean;
    cover_image: {
      thumbnail_url: string;
      desktop_url: string;
      alt: string;
    } | null;
  }>,
  message: "OK"
}
```

**Notes:**
- Priority: same material_type > same category > random
- Excludes current product
- Ref: BA A5.4

---

# GROUP 5: MEDIA (`/api/media`)

## POST /api/media/upload

- **Guard:** @Admin
- **Description:** Upload an image file. Triggers async processing via BullMQ.

**Request:** `multipart/form-data`
```typescript
{
  file: File;           // required, max 20MB
  alt?: string;         // alt text for accessibility
}
```

**Validation:**
- MIME type: `image/jpeg`, `image/png`, `image/webp` only
- File extension: `.jpg`, `.jpeg`, `.png`, `.webp` only
- Max file size: 20MB
- Magic bytes validated (not just extension)

**Response 201:**
```typescript
{
  success: true,
  data: {
    id: string;                   // ULID
    original_url: string;         // R2 private bucket URL (signed, 1h expiry)
    filename: string;
    mime_type: string;
    size: number;                 // bytes
    status: 'processing';        // processing | ready | failed
    alt: string;
    created_at: string;
  },
  message: "Upload successful. Processing in background."
}
```

**Response 400:**
```typescript
{
  success: false,
  data: null,
  message: "Invalid file type. Allowed: JPEG, PNG, WebP."
}
```

**Response 413:**
```typescript
{
  success: false,
  data: null,
  message: "File too large. Maximum size is 20MB."
}
```

**Notes:**
- Original uploaded to R2 private bucket
- BullMQ IMAGE_JOB dispatched: resize to 2048px (desktop) + 768px (mobile), convert to WebP 80%, strip EXIF metadata, upload processed images to R2 public bucket
- Media record updated with thumbnail/desktop URLs when processing completes
- Socket.io event `media:ready` emitted to uploading admin when processing done
- Ref: BA B3.5

---

## GET /api/media/:id

- **Guard:** @Auth
- **Description:** Get media metadata.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    original_url: string;          // signed URL, 1h expiry
    thumbnail_url: string | null;  // 768px WebP (null if still processing)
    desktop_url: string | null;    // 2048px WebP (null if still processing)
    filename: string;
    mime_type: string;
    size: number;
    width: number | null;          // original width px
    height: number | null;         // original height px
    alt: string;
    status: 'processing' | 'ready' | 'failed';
    created_at: string;
  },
  message: "OK"
}
```

---

## DELETE /api/media/:id

- **Guard:** @Admin
- **Description:** Soft delete media. Marks for R2 cleanup.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Media deleted"
}
```

**Notes:**
- Sets `deleted_at = NOW()`
- R2 files cleaned up by scheduled CLEANUP_JOB (runs daily)
- Cannot delete if actively used in a published project gallery (returns 409)

---

## GET /api/media

- **Guard:** @Admin
- **Description:** List all media with pagination.

**Query params:**
```typescript
{
  page?: number;          // default 1
  limit?: number;         // default 20, max 50
  status?: 'processing' | 'ready' | 'failed';
  sort?: 'created_at' | 'size';
  order?: 'asc' | 'desc';
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    thumbnail_url: string | null;
    desktop_url: string | null;
    filename: string;
    mime_type: string;
    size: number;
    width: number | null;
    height: number | null;
    alt: string;
    status: 'processing' | 'ready' | 'failed';
    created_at: string;
  }>,
  message: "OK",
  meta: { page: number; limit: number; total: number; totalPages: number; }
}
```

---

# GROUP 6: CONSULTATIONS (`/api/consultations`)

## POST /api/consultations

- **Guard:** @Public
- **Rate limit:** 1 request / minute per IP, 3 requests / hour per IP
- **Description:** Submit a consultation request form.

**Request body:**
```typescript
{
  name: string;                // required, max 100 chars
  email: string;               // required, valid email
  phone?: string;              // optional, Vietnamese phone format
  project_type: string;        // required: 'interior-design' | 'apartment' | 'villa' | 'office' | 'townhouse' | 'other'
  area?: number;               // square meters
  budget_range?: string;       // e.g. '100-300', '300-500', '500-1000', '1000+'  (millions VND)
  message?: string;            // max 2000 chars
  product_id?: string;         // ULID, if requesting quote for specific product
  source_page?: string;        // which page the form was submitted from
  honeypot?: string;           // hidden field, must be empty (bot trap)
}
```

**Response 201:**
```typescript
{
  success: true,
  data: {
    id: string;
    ref_code: string;          // e.g. "VN-2026-001"
  },
  message: "Consultation request submitted. We will contact you within 24 hours."
}
```

**Response 400:** Validation errors.

**Response 429:**
```typescript
{
  success: false,
  data: null,
  message: "Please wait before submitting another request."
}
```

**Notes:**
- If `honeypot` field is non-empty, silently accept but do not store (bot detected)
- Triggers:
  1. BullMQ MAIL_JOB type `consultation_confirmation` -- email to customer
  2. BullMQ MAIL_JOB type `consultation_admin_notification` -- email to admin
  3. Socket.io event `consultation:new` to admin room
- Initial status: `new`
- Ref: BA A2.6, A5.5, A7.1, B4.4, B4.5

---

## GET /api/consultations

- **Guard:** @Admin
- **Description:** List consultations with filters.

**Query params:**
```typescript
{
  page?: number;              // default 1
  limit?: number;             // default 20, max 50
  status?: 'new' | 'contacted' | 'scheduled' | 'completed';
  from?: string;              // ISO date, start of date range
  to?: string;                // ISO date, end of date range
  q?: string;                 // search by name, email, phone
  sort?: 'created_at' | 'name' | 'status';
  order?: 'asc' | 'desc';
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    ref_code: string;
    name: string;
    email: string;
    phone: string | null;
    project_type: string;
    area: number | null;
    budget_range: string | null;
    message: string | null;
    product: {
      id: string;
      name: string;
    } | null;
    status: 'new' | 'contacted' | 'scheduled' | 'completed';
    status_notes: Array<{
      status: string;
      note: string | null;
      changed_by: string;       // admin name
      changed_at: string;
    }>;
    source_page: string | null;
    created_at: string;
    updated_at: string;
  }>,
  message: "OK",
  meta: { page: number; limit: number; total: number; totalPages: number; }
}
```

**Notes:**
- Ref: BA B4.1, B4.3

---

## GET /api/consultations/:id

- **Guard:** @Admin
- **Description:** Get single consultation with full details.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    ref_code: string;
    name: string;
    email: string;
    phone: string | null;
    project_type: string;
    area: number | null;
    budget_range: string | null;
    message: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
    } | null;
    status: 'new' | 'contacted' | 'scheduled' | 'completed';
    status_notes: Array<{
      status: string;
      note: string | null;
      changed_by: string;
      changed_at: string;
    }>;
    source_page: string | null;
    created_at: string;
    updated_at: string;
  },
  message: "OK"
}
```

---

## PUT /api/consultations/:id/status

- **Guard:** @Admin
- **Description:** Update consultation status. Must follow workflow order.

**Params:** `id` -- ULID

**Request body:**
```typescript
{
  status: 'contacted' | 'scheduled' | 'completed';   // required
  note?: string;                                       // optional note for status change
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    status: string;
    updated_at: string;
  },
  message: "Status updated to contacted"
}
```

**Response 400:**
```typescript
{
  success: false,
  data: null,
  message: "Invalid status transition. Cannot go from 'completed' to 'contacted'."
}
```

**Notes:**
- Valid transitions: `new -> contacted -> scheduled -> completed`
- No backward transitions (except super admin override)
- Records who changed status and when in `status_notes`
- Triggers Socket.io event `consultation:status` to admin room
- Ref: BA B4.2

---

## DELETE /api/consultations/:id

- **Guard:** @Admin
- **Description:** Soft delete a consultation.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Consultation deleted"
}
```

---

# GROUP 7: PAGE BUILDER (`/api/pages`)

## GET /api/pages/homepage

- **Guard:** @Public
- **Description:** Get the published homepage configuration.

**Response 200:**
```typescript
{
  success: true,
  data: {
    version: number;
    published_at: string;
    sections: Array<{
      id: string;
      type: 'hero' | 'about' | 'featured_projects' | 'materials' | 'testimonials' | 'cta_form' | 'stats' | 'custom_html';
      order: number;
      visible: boolean;
      config: Record<string, any>;   // section-specific config, see below
    }>;
  },
  message: "OK"
}
```

**Section config schemas:**

```typescript
// type: 'hero'
{
  image_url: string;
  headline: string;
  description: string;
  cta_primary: { text: string; url: string; };
  cta_secondary: { text: string; url: string; };
  stats: Array<{ label: string; value: string; }>;   // e.g. [{ label: "Du an", value: "500+" }]
}

// type: 'about'
{
  headline: string;
  content: string;          // rich text HTML
  image_url: string;
  stats: Array<{ label: string; value: string; }>;
}

// type: 'featured_projects'
{
  headline: string;
  view_all_text: string;
  view_all_url: string;
  project_ids: string[];     // ULIDs of selected projects (max 6)
}

// type: 'materials'
{
  headline: string;
  items: Array<{
    name: string;
    image_url: string;
    filter_slug: string;     // links to product filter
  }>;
}

// type: 'testimonials'
{
  headline: string;
  items: Array<{
    content: string;
    author_name: string;
    author_title: string;
    rating: number;          // 1-5
    avatar_url: string | null;
  }>;
}

// type: 'cta_form'
{
  headline: string;
  description: string;
  background_image_url: string | null;
}

// type: 'stats'
{
  items: Array<{ label: string; value: number; suffix: string; }>;
  // e.g. [{ label: "Du an", value: 150, suffix: "+" }]
}
```

**Notes:**
- Response heavily cached (Redis, TTL 5 min). Cache invalidated on publish.
- Ref: BA B5.1, B5.2

---

## GET /api/pages/homepage/draft

- **Guard:** @Admin
- **Description:** Get the current draft version of homepage config.

**Response 200:** Same structure as published, but may have unpublished changes.

**Notes:**
- Returns latest saved draft, which may differ from published version
- Ref: BA B5.6

---

## PUT /api/pages/homepage

- **Guard:** @Admin
- **Description:** Save homepage configuration as draft (does not publish).

**Request body:**
```typescript
{
  sections: Array<{
    id?: string;
    type: string;
    order: number;
    visible: boolean;
    config: Record<string, any>;
  }>;
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    version: number;
    saved_at: string;
  },
  message: "Draft saved"
}
```

**Notes:**
- Auto-save calls this endpoint every 30 seconds
- Keeps last 5 draft versions for rollback
- Ref: BA B5.7

---

## POST /api/pages/homepage/publish

- **Guard:** @Admin
- **Description:** Publish the current draft to make it live.

**Response 200:**
```typescript
{
  success: true,
  data: {
    version: number;
    published_at: string;
  },
  message: "Homepage published successfully"
}
```

**Notes:**
- Copies current draft to published state
- Invalidates Redis cache for homepage
- Ref: BA B5.7

---

## GET /api/pages/homepage/sections

- **Guard:** @Admin
- **Description:** List available section types for the page builder.

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    type: string;
    label: string;
    description: string;
    default_config: Record<string, any>;
    icon: string;
  }>,
  message: "OK"
}
```

**Notes:**
- Used by FE to show "Add Section" menu
- Ref: BA B5.5

---

# GROUP 8: ANALYTICS (`/api/analytics`)

## POST /api/analytics/pageview

- **Guard:** @Public
- **Description:** Record a page view event.

**Request body:**
```typescript
{
  path: string;              // required, e.g. "/projects/modern-villa"
  referrer?: string;
  title?: string;            // page title
}
```

**Response 204:** No content.

**Notes:**
- User agent and IP extracted from request headers
- Bot filtering: skip recording if User-Agent matches known bot patterns (Googlebot, Bingbot, etc.)
- Admin IP exclusion: skip if IP matches admin IP whitelist in settings
- Writes to Redis: `INCR analytics:pageview:{date}:{path}`, `PFADD analytics:visitors:{date} {ip}`
- NOT written to MySQL directly (flushed by TRAFFIC_SYNC_JOB)
- Ref: BA B6.1, B6.2

---

## GET /api/analytics/overview

- **Guard:** @Admin
- **Description:** Dashboard KPI summary.

**Query params:**
```typescript
{
  period?: '7d' | '30d' | '90d';   // default '30d'
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    total_visitors: number;
    total_visitors_change: number;         // percentage change vs previous period
    avg_session_duration: number;          // seconds
    avg_session_change: number | null;
    conversion_rate: number;               // percentage (consultations / visitors)
    conversion_change: number;
    total_inquiries: number;
    inquiries_change: number;
    total_projects: number;
    total_products: number;
    period: string;
  },
  message: "OK"
}
```

**Notes:**
- Conversion = (consultations in period / unique visitors in period) * 100
- `_change` fields: positive = increase, negative = decrease, vs previous equivalent period
- Ref: BA B2.1

---

## GET /api/analytics/traffic

- **Guard:** @Admin
- **Description:** Traffic data over time for charts.

**Query params:**
```typescript
{
  period?: '7d' | '30d' | '90d';
  interval?: 'hour' | 'day' | 'week';    // default: 'day' for 7d/30d, 'week' for 90d
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    labels: string[];           // ISO dates
    page_views: number[];       // page view counts per interval
    visitors: number[];         // unique visitor counts per interval
    previous_period?: {
      page_views: number[];
      visitors: number[];
    };
  },
  message: "OK"
}
```

**Notes:**
- Ref: BA B6.1

---

## GET /api/analytics/top-pages

- **Guard:** @Admin
- **Description:** Top pages ranked by view count.

**Query params:**
```typescript
{
  limit?: number;       // default 10, max 50
  period?: '7d' | '30d' | '90d';
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    path: string;
    title: string | null;
    views: number;
    unique_visitors: number;
    avg_time_on_page: number | null;    // seconds
  }>,
  message: "OK"
}
```

---

## GET /api/analytics/devices

- **Guard:** @Admin
- **Description:** Device type breakdown.

**Query params:**
```typescript
{
  period?: '7d' | '30d' | '90d';
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    desktop: { count: number; percentage: number; };
    mobile: { count: number; percentage: number; };
    tablet: { count: number; percentage: number; };
  },
  message: "OK"
}
```

---

## GET /api/analytics/sources

- **Guard:** @Admin
- **Description:** Traffic sources breakdown.

**Query params:**
```typescript
{
  period?: '7d' | '30d' | '90d';
  limit?: number;       // default 10
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    source: string;          // e.g. "google", "facebook", "direct", "zalo"
    visits: number;
    percentage: number;
  }>,
  message: "OK"
}
```

---

# GROUP 9: USERS (`/api/users`)

## GET /api/users

- **Guard:** @Admin
- **Description:** List admin/editor users.

**Query params:**
```typescript
{
  page?: number;
  limit?: number;
  role?: 'admin' | 'editor';
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor';
    avatar_url: string | null;
    last_login_at: string | null;
    created_at: string;
  }>,
  message: "OK",
  meta: { page: number; limit: number; total: number; totalPages: number; }
}
```

---

## POST /api/users

- **Guard:** @Admin
- **Description:** Create a new admin or editor user.

**Request body:**
```typescript
{
  name: string;                   // required, max 100 chars
  email: string;                  // required, valid email, unique
  password: string;               // required, min 8 chars, 1 uppercase, 1 number, 1 special
  role: 'admin' | 'editor';      // required
}
```

**Response 201:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  },
  message: "User created successfully"
}
```

**Response 409:**
```typescript
{
  success: false,
  data: null,
  message: "Email already exists"
}
```

**Notes:**
- Password hashed with bcrypt (cost 12) before storage

---

## PUT /api/users/:id

- **Guard:** @Admin
- **Description:** Update user details (not password).

**Params:** `id` -- ULID

**Request body:**
```typescript
{
  name?: string;
  email?: string;
  role?: 'admin' | 'editor';
  avatar_url?: string;
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    updated_at: string;
  },
  message: "User updated successfully"
}
```

---

## DELETE /api/users/:id

- **Guard:** @Admin
- **Description:** Soft delete a user.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "User deleted successfully"
}
```

**Response 400:**
```typescript
{
  success: false,
  data: null,
  message: "Cannot delete your own account"
}
```

**Notes:**
- Cannot delete self (compare `req.user.id` with `:id`)
- All refresh tokens for deleted user are revoked

---

## PUT /api/users/:id/password

- **Guard:** @Admin
- **Description:** Change a user's password.

**Params:** `id` -- ULID

**Request body:**
```typescript
{
  current_password?: string;       // required if changing own password
  new_password: string;            // required, min 8 chars, 1 uppercase, 1 number, 1 special
}
```

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Password changed successfully"
}
```

**Response 400:**
```typescript
{
  success: false,
  data: null,
  message: "Current password is incorrect"
}
```

**Notes:**
- If changing own password, `current_password` is required and verified
- If admin changing another user's password, `current_password` not required
- All existing refresh tokens for target user are revoked after password change

---

# GROUP 10: SETTINGS (`/api/settings`)

## GET /api/settings

- **Guard:** @Admin
- **Description:** Get all site settings.

**Response 200:**
```typescript
{
  success: true,
  data: {
    company_name: string;
    address: string;
    phone: string;
    email: string;
    social_links: {
      zalo: string | null;
      facebook: string | null;
      instagram: string | null;
      youtube: string | null;
      messenger: string | null;
    };
    showroom_hours: {
      weekday: string;          // e.g. "08:00 - 18:00"
      saturday: string;
      sunday: string;
    };
    notification_sound: boolean;
    admin_ip_whitelist: string[];   // IPs excluded from analytics
  },
  message: "OK"
}
```

---

## PUT /api/settings

- **Guard:** @Admin
- **Description:** Update site settings.

**Request body:** Same structure as GET response `data` (all fields optional, partial update).

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Settings updated successfully"
}
```

**Notes:**
- Invalidates Redis cache for settings
- Ref: BA A1.4, A7.3, A7.4

---

## GET /api/settings/seo

- **Guard:** @Admin
- **Description:** Get default SEO settings.

**Response 200:**
```typescript
{
  success: true,
  data: {
    site_title: string;                    // e.g. "VietNet Interior Design"
    default_meta_description: string;
    default_og_image_url: string | null;
    google_analytics_id: string | null;
    canonical_base_url: string;            // e.g. "https://bhquan.site"
    robots_txt_content: string;
  },
  message: "OK"
}
```

---

## PUT /api/settings/seo

- **Guard:** @Admin
- **Description:** Update SEO defaults.

**Request body:** Same structure as GET response `data` (all optional).

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "SEO settings updated"
}
```

**Notes:**
- Ref: BA A4.6

---

## GET /api/settings/email

- **Guard:** @Admin
- **Description:** Get email template settings.

**Response 200:**
```typescript
{
  success: true,
  data: {
    consultation_confirmation: {
      subject: string;
      body_template: string;      // HTML with {{name}}, {{ref_code}}, {{project_type}} placeholders
    };
    consultation_admin_notification: {
      subject: string;
      body_template: string;
    };
    password_reset: {
      subject: string;
      body_template: string;      // HTML with {{name}}, {{reset_link}} placeholders
    };
  },
  message: "OK"
}
```

---

## PUT /api/settings/email

- **Guard:** @Admin
- **Description:** Update email templates.

**Request body:** Same structure as GET response `data` (all optional).

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Email templates updated"
}
```

**Notes:**
- Ref: BA B4.5

---

# GROUP 11: SEARCH (`/api/search`)

## GET /api/search

- **Guard:** @Public
- **Description:** Full-text search across projects and products.

**Query params:**
```typescript
{
  q: string;                              // required, min 2 chars
  type?: 'all' | 'projects' | 'products'; // default 'all'
  page?: number;                          // default 1
  limit?: number;                         // default 10 (5 per type when 'all'), max 50
}
```

**Response 200:**
```typescript
{
  success: true,
  data: {
    projects: Array<{
      id: string;
      title: string;
      slug: string;
      description: string;         // truncated, with <mark> around matched terms
      category: { name: string; slug: string; };
      cover_image: {
        thumbnail_url: string;
      } | null;
      type: 'project';
    }>;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      material_type: string;
      cover_image: {
        thumbnail_url: string;
      } | null;
      type: 'product';
    }>;
    total_projects: number;
    total_products: number;
  },
  message: "OK",
  meta: {
    page: number;
    limit: number;
    total: number;              // total_projects + total_products
    totalPages: number;
  }
}
```

**Notes:**
- MySQL FULLTEXT search on title/name + description columns
- Only searches published, non-deleted records
- When `type = 'all'` and `limit = 10`, returns up to 5 projects + 5 products
- Debounce on FE: 300ms before sending request
- Ref: BA A8.1, A8.2, A8.3

---

# GROUP 12: SEO (`/api/seo`)

## GET /api/sitemap.xml

- **Guard:** @Public
- **Description:** Dynamic XML sitemap for search engines.

**Response 200 (Content-Type: application/xml):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bhquan.site/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://bhquan.site/projects/{slug}</loc>
    <lastmod>{updated_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- all published projects and products -->
</urlset>
```

**Notes:**
- Includes: homepage, all published projects, all products, about, contact, catalog pages
- Cached in Redis (TTL 1 hour), invalidated on publish/unpublish
- Ref: BA A4.6

---

## GET /api/robots.txt

- **Guard:** @Public
- **Description:** Dynamic robots.txt file.

**Response 200 (Content-Type: text/plain):**
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /preview

Sitemap: https://bhquan.site/api/sitemap.xml
```

---

# GROUP 13: HEALTH

## GET /api/health

- **Guard:** @Public
- **Description:** System health check.

**Response 200:**
```typescript
{
  success: true,
  data: {
    status: 'ok';
    uptime: number;              // seconds
    timestamp: string;           // ISO 8601
    services: {
      database: 'connected' | 'disconnected';
      redis: 'connected' | 'disconnected';
      r2: 'connected' | 'disconnected';
      bullmq: 'connected' | 'disconnected';
    };
    version: string;             // git commit hash
  },
  message: "OK"
}
```

**Response 503:**
```typescript
{
  success: false,
  data: {
    status: 'degraded';
    services: { /* same structure, showing which is disconnected */ };
  },
  message: "Service degraded"
}
```

---

# GROUP 14: NOTIFICATIONS (`/api/notifications`)

## GET /api/notifications

- **Guard:** @Admin
- **Description:** List notifications for current admin user.

**Query params:**
```typescript
{
  page?: number;
  limit?: number;          // default 20
  unread_only?: boolean;   // default false
}
```

**Response 200:**
```typescript
{
  success: true,
  data: Array<{
    id: string;
    type: 'consultation_new' | 'project_published' | 'system_error';
    title: string;
    body: string;
    link: string | null;           // URL to navigate to
    read: boolean;
    created_at: string;
  }>,
  message: "OK",
  meta: { page: number; limit: number; total: number; totalPages: number; unread_count: number; }
}
```

**Notes:**
- `unread_count` always returned in meta regardless of filters
- Ref: BA B2.8

---

## PUT /api/notifications/:id/read

- **Guard:** @Admin
- **Description:** Mark a notification as read.

**Params:** `id` -- ULID

**Response 200:**
```typescript
{
  success: true,
  data: null,
  message: "Notification marked as read"
}
```

---

## PUT /api/notifications/read-all

- **Guard:** @Admin
- **Description:** Mark all notifications as read for current user.

**Response 200:**
```typescript
{
  success: true,
  data: { updated: number; },
  message: "All notifications marked as read"
}
```

---

# SOCKET.IO EVENTS

## Connection

- **Namespace:** `/` (default)
- **Auth:** JWT access token sent in `auth.token` handshake option
- **Connection rejected** if token invalid/expired (error event with `401`)

## Server -> Client Events

| Event | Payload | Room | Description |
|---|---|---|---|
| `consultation:new` | `{ id: string; ref_code: string; name: string; project_type: string; created_at: string; }` | `admin` | New consultation submitted from public website |
| `consultation:status` | `{ id: string; status: string; changed_by: string; changed_at: string; }` | `admin` | Consultation status changed by an admin |
| `media:ready` | `{ id: string; thumbnail_url: string; desktop_url: string; status: 'ready' \| 'failed'; }` | `user:{userId}` | Media processing completed |
| `analytics:pageview` | `{ path: string; count: number; timestamp: string; }` | `admin` | Real-time page view counter (batched every 10s) |
| `notification:new` | `{ id: string; type: string; title: string; body: string; link: string \| null; }` | `user:{userId}` | New notification for specific admin |

## Client -> Server Events

| Event | Payload | Description |
|---|---|---|
| `join:admin` | `{}` | Admin joins the admin room after login. Server verifies admin role before adding to room. |

---

# BULLMQ JOBS

## IMAGE_JOB

- **Queue:** `image-processing`
- **Concurrency:** 3
- **Retry:** 3 attempts, exponential backoff (1s, 4s, 16s)

**Payload:**
```typescript
{
  mediaId: string;           // ULID
  originalKey: string;       // R2 key of original file
  originalBucket: string;    // R2 private bucket name
}
```

**Processing steps:**
1. Download original from R2 private bucket
2. Read dimensions (width, height) with Sharp
3. Resize to 2048px width (desktop), maintain aspect ratio
4. Resize to 768px width (mobile/thumbnail), maintain aspect ratio
5. Convert both to WebP, quality 80%
6. Strip all EXIF metadata
7. Upload processed images to R2 public bucket with keys:
   - `media/{mediaId}/desktop.webp`
   - `media/{mediaId}/thumbnail.webp`
8. Update media record in MySQL: `status = 'ready'`, set `thumbnail_url`, `desktop_url`, `width`, `height`
9. Emit Socket.io event `media:ready` to uploader's user room

**On failure (after 3 retries):**
- Update media record: `status = 'failed'`
- Emit Socket.io event `media:ready` with `status: 'failed'`
- Log error with mediaId for manual investigation

---

## MAIL_JOB

- **Queue:** `email`
- **Concurrency:** 5
- **Retry:** 3 attempts, exponential backoff (2s, 8s, 32s)

**Payload:**
```typescript
{
  type: 'consultation_confirmation' | 'consultation_admin_notification' | 'password_reset';
  to: string;               // email address
  data: {
    name?: string;
    ref_code?: string;
    project_type?: string;
    reset_link?: string;
    consultation_details?: Record<string, string>;
  };
}
```

**Processing steps:**
1. Load email template from settings (DB) based on `type`
2. Replace placeholders (`{{name}}`, `{{ref_code}}`, etc.) with `data` values
3. Send via Resend API with VietNet branded `from` address
4. Log success/failure with message ID

**On failure (after 3 retries):**
- Log error with email address and type for manual retry
- Do NOT expose failure to end user (consultation was already accepted)

---

## TRAFFIC_SYNC_JOB

- **Queue:** `analytics`
- **Schedule:** Cron every 10 minutes (`*/10 * * * *`)
- **Concurrency:** 1

**Processing steps:**
1. Read all Redis keys matching `analytics:pageview:{date}:*`
2. Read all Redis keys matching `analytics:visitors:{date}` (HyperLogLog)
3. Aggregate data and batch INSERT/UPDATE into MySQL `analytics_pageviews` table
4. Delete processed Redis keys (only those older than current 10-min window)
5. Compute device breakdown from stored user_agent data
6. Compute traffic source breakdown from stored referrer data

**Notes:**
- Uses Redis MULTI/EXEC for atomic read-and-delete
- If MySQL insert fails, Redis keys are NOT deleted (retry on next run)

---

## CLEANUP_JOB

- **Queue:** `maintenance`
- **Schedule:** Cron daily at 03:00 AM (`0 3 * * *`)
- **Concurrency:** 1

**Processing steps:**
1. Find all media records where `deleted_at IS NOT NULL` and `deleted_at < NOW() - 7 days`
2. Delete corresponding files from R2 (both private and public buckets)
3. Physically delete media records from MySQL
4. Clean up orphaned gallery/product_image references
5. Log count of cleaned items

---

# DATABASE SCHEMA CHANGES

## Tables

| Table | Description |
|---|---|
| `users` | Admin/editor accounts |
| `categories` | Project categories |
| `projects` | Interior design projects |
| `project_gallery` | Project-image junction (with order) |
| `products` | Kitchen cabinet products |
| `product_images` | Product-image junction (with order) |
| `media` | Uploaded media files metadata |
| `consultations` | Consultation requests |
| `consultation_status_log` | Status change history |
| `page_configs` | Page builder JSON configs |
| `page_config_versions` | Version history for page configs |
| `settings` | Key-value site settings |
| `notifications` | Admin notifications |
| `analytics_pageviews` | Aggregated page view data |
| `analytics_sessions` | Session-level data |
| `password_reset_tokens` | One-time reset tokens |
| `refresh_tokens` | Active refresh tokens |

## Key Indexes

- `projects`: INDEX on `(status, deleted_at, created_at)`, UNIQUE on `slug`, FULLTEXT on `(title, description)`
- `products`: INDEX on `(material_type, deleted_at)`, UNIQUE on `slug`, FULLTEXT on `(name, description)`
- `consultations`: INDEX on `(status, created_at)`, INDEX on `(name, email, phone)` for search
- `media`: INDEX on `(status, deleted_at)`
- `analytics_pageviews`: INDEX on `(date, path)`
- `refresh_tokens`: INDEX on `(user_id, expires_at)`, INDEX on `(token_hash)`

---

# TECHNICAL RISKS

| Risk | Mitigation |
|---|---|
| Image upload abuse (large files, many uploads) | Rate limit uploads per admin (20/hour), validate MIME + magic bytes, max 20MB |
| Analytics data volume | Redis counters with periodic MySQL sync (10 min), HyperLogLog for unique visitors |
| Page builder config corruption | Version history (keep 5 versions), JSON schema validation before save |
| Email delivery failures | BullMQ retry with exponential backoff, dead letter queue for manual review |
| JWT token theft | HttpOnly + Secure + SameSite=Strict cookies, short access token TTL (60 min), refresh token rotation |
| Brute force login | Rate limit 5 fails/10min per IP, account lockout after 5 consecutive failures |
| Bot traffic skewing analytics | User-Agent based bot filtering, admin IP exclusion |
| R2 storage costs | Soft delete with 7-day retention before physical cleanup, WebP compression |
| SQL injection | Parameterized queries via Drizzle ORM, input validation via class-validator DTOs |
| ULID validation bypass | Validate ULID format (26 chars, Crockford Base32) before any DB query |

---

## SA_DONE

- **API endpoints designed:** 65 endpoints across 14 groups
- **Real-time events:** 5 server-to-client, 1 client-to-server Socket.io events
- **Background jobs:** 4 BullMQ job types (IMAGE_JOB, MAIL_JOB, TRAFFIC_SYNC_JOB, CLEANUP_JOB)
- **Database tables:** 18 tables with key indexes defined
- **Technical risks:** 10 identified with mitigations
- **All BA features covered:** A1-A9 (Public), B1-B8 (Admin), C1-C4 (System)
- **System flow:** Public user -> Vue 3 SPA -> NestJS API -> MySQL/Redis/R2
- **Auth flow:** Login -> JWT cookies -> Auto-refresh -> Logout with revocation
