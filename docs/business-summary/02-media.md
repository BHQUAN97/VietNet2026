# 02. Media Pipeline

> Module: C1 (Media) | Features: C1.1 Upload, C1.2 Image Processing, C1.3 R2 Storage
> Priority: P0 | Status: Spec Done

---

## Summary

He thong upload va xu ly hinh anh tu dong. Admin upload hinh → luu original vao R2 private bucket → BullMQ IMAGE_JOB xu ly nen (Sharp) → upload processed versions vao R2 public bucket. Toan bo xu ly chay background, khong block request. Ho tro tracking trang thai (pending → processing → completed/failed) va thong bao real-time qua Socket.io khi xu ly xong.

---

## Workflow

### Upload Flow
```
Admin upload file qua form
  → [1] Auth middleware: requireAuth
  → [2] Validate:
      - MIME type: image/jpeg, image/png, image/webp
      - File extension phai match MIME
      - Magic bytes verify (header file)
      - Max size: 20MB
      - Max dimensions: 8000x8000px
  → [3] Upload original → R2 private bucket
      - Path: /{year}/{month}/{ulid}/original.{ext}
      - Generate signed URL (1h expiry)
  → [4] INSERT media record (status: 'pending')
  → [5] Enqueue IMAGE_JOB vao BullMQ
  → [6] Tra 201 { id, originalUrl, status: 'pending' }
```

### IMAGE_JOB Worker (Background)
```
  → [1] Update status: 'processing'
  → [2] Download original tu R2
  → [3] Sharp processing:
      - Resize 2048px width (desktop/preview)
      - Resize 768px width (mobile/thumbnail)
      - Convert WebP quality 80%
      - Strip ALL EXIF metadata
      - Generate blurhash (LQIP placeholder)
      - Doc dimensions (width, height)
  → [4] Upload processed → R2 public bucket:
      - media/{ulid}/desktop.webp
      - media/{ulid}/thumbnail.webp
  → [5] Update media record:
      - SET thumbnail_url, desktop_url, width, height, blurhash
      - SET status = 'completed'
  → [6] Socket.io emit 'media:ready' → room user:{uploadedBy}
```

### Failure Handling
```
  Sau 3 retries (exponential backoff: 1s, 4s, 16s):
  → SET status = 'failed', processing_error = error.message
  → Emit 'media:ready' voi status: 'failed'
  → Log error cho manual investigation
```

### Cleanup Job (Daily 03:00 AM)
```
  → Tim media co deleted_at > 7 ngay truoc
  → Xoa files tu R2 (ca private va public buckets)
  → Xoa record khoi MySQL (physical delete)
  → Clean orphaned gallery/product_image references
```

---

## Giai phap chi tiet

### API Endpoints (4 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| POST | `/api/media/upload` | @Admin | Upload file (multipart/form-data) |
| GET | `/api/media/:id` | @Auth | Lay metadata media |
| GET | `/api/media` | @Admin | List media voi pagination |
| DELETE | `/api/media/:id` | @Admin | Soft delete (409 neu dang dung trong published project) |

### DB Table: media

| Column | Type | Mo ta |
|--------|------|-------|
| id | VARCHAR(26) | ULID |
| original_filename | VARCHAR(255) | Ten file goc |
| mime_type | VARCHAR(50) | image/jpeg, png, webp |
| file_size | INT UNSIGNED | Bytes |
| original_url | VARCHAR(500) | R2 private bucket |
| thumbnail_url | VARCHAR(500) | 768px WebP (NULL khi dang processing) |
| preview_url | VARCHAR(500) | 2048px WebP (NULL khi dang processing) |
| width, height | INT UNSIGNED | Original dimensions |
| alt_text | VARCHAR(255) | SEO + accessibility |
| blurhash | VARCHAR(100) | Blur placeholder hash |
| processing_status | ENUM | pending, processing, completed, failed |
| uploaded_by | VARCHAR(26) | FK → users |

### BullMQ Config

- Queue: `image-processing`
- Concurrency: 3 (gioi han RAM, tranh OOM voi 4K images)
- Retry: 3 attempts, exponential backoff
- Dead letter queue: failed sau 3 retries

### R2 Storage Structure

```
Private bucket (originals):
  /{year}/{month}/{ulid}/original.{ext}

Public bucket (processed):
  media/{ulid}/desktop.webp    (2048px)
  media/{ulid}/thumbnail.webp  (768px)
```

### Rate Limit

- Upload: 20 files/hour per admin
- Max file: 20MB
- Validate MIME + magic bytes (chong disguised files)

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Auth module da hoan thanh (can @Auth, @AdminOnly guards)
- Redis + BullMQ da setup (tu Stage 1)
- R2 credentials: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET_PRIVATE, R2_BUCKET_PUBLIC
- Packages: `sharp`, `@aws-sdk/client-s3`, `@nestjs/bullmq`, `multer`, `file-type`

### File Structure (Backend)

```
backend/src/modules/media/
├── media.module.ts              # Import BullModule.registerQueue('image-processing')
├── media.controller.ts          # POST upload (multipart), GET list, GET :id, DELETE
├── media.service.ts             # Upload logic, R2 interaction, status tracking
├── entities/
│   └── media.entity.ts          # processing_status enum, urls, dimensions, blurhash
└── dto/
    ├── upload-media.dto.ts      # alt_text optional
    └── query-media.dto.ts       # status filter, pagination

backend/src/common/services/
├── r2-storage.service.ts        # AWS SDK v3: upload, getSignedUrl, delete
└── base-media-association.service.ts  # Sync gallery/product_images junction

backend/src/queues/
├── queues.module.ts             # Register all BullMQ queues
├── image.processor.ts           # IMAGE_JOB worker
└── mail.processor.ts            # (trien khai cung luc)

backend/src/common/helpers/
└── file-validator.ts            # MIME check, magic bytes, dimensions
```

### Thu tu implement (Backend)

**Buoc 1: R2 Storage Service**
```typescript
// r2-storage.service.ts
@Injectable()
export class R2StorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  // upload(bucket, key, buffer, contentType): PutObjectCommand
  // getSignedUrl(bucket, key, expiresIn=3600): GetObjectCommand + getSignedUrl
  // delete(bucket, key): DeleteObjectCommand
}
```

**Buoc 2: File Validator**
```typescript
// file-validator.ts
export async function validateUploadedFile(file: Express.Multer.File) {
  // 1. Check size <= 20MB
  if (file.size > 20 * 1024 * 1024) throw new BadRequestException('File too large');

  // 2. Check MIME whitelist
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) throw new BadRequestException('Invalid type');

  // 3. Magic bytes verify (dung thu vien 'file-type')
  const fileType = await fileTypeFromBuffer(file.buffer);
  if (!fileType || !allowedMimes.includes(fileType.mime))
    throw new BadRequestException('File content does not match extension');

  // 4. Check dimensions voi Sharp
  const metadata = await sharp(file.buffer).metadata();
  if (metadata.width > 8000 || metadata.height > 8000)
    throw new BadRequestException('Image dimensions too large');
}
```

**Buoc 3: Media Entity + Migration**
```
media.entity.ts:
  - id: char(26) ULID
  - original_filename, mime_type, file_size
  - original_url (R2 private), thumbnail_url (R2 public), preview_url (R2 public)
  - width, height (original), blurhash
  - processing_status: enum('pending','processing','completed','failed')
  - processing_error: text null
  - uploaded_by: FK → users
  - alt_text, created_at, deleted_at
```

**Buoc 4: Media Service**
```
upload(file, userId):
  1. validateUploadedFile(file)
  2. const id = generateUlid()
  3. const r2Key = `${year}/${month}/${id}/original.${ext}`
  4. await r2.upload(PRIVATE_BUCKET, r2Key, file.buffer, file.mimetype)
  5. const signedUrl = await r2.getSignedUrl(PRIVATE_BUCKET, r2Key, 3600)
  6. INSERT media { id, original_filename, mime_type, file_size, original_url: r2Key,
                     processing_status: 'pending', uploaded_by: userId }
  7. await this.imageQueue.add('process', { mediaId: id, originalKey: r2Key })
  8. return { id, originalUrl: signedUrl, status: 'pending' }
```

**Buoc 5: IMAGE_JOB Processor**
```typescript
// image.processor.ts
@Processor('image-processing')
export class ImageProcessor extends WorkerHost {
  async process(job: Job<{ mediaId: string; originalKey: string }>) {
    const { mediaId, originalKey } = job.data;

    // 1. Update status → 'processing'
    await this.mediaRepo.update(mediaId, { processing_status: 'processing' });

    // 2. Download tu R2
    const buffer = await this.r2.download(PRIVATE_BUCKET, originalKey);

    // 3. Sharp processing
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const desktop = await image.clone()
      .resize(2048, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const thumbnail = await image.clone()
      .resize(768, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // 4. Upload → R2 public
    const desktopKey = `media/${mediaId}/desktop.webp`;
    const thumbKey = `media/${mediaId}/thumbnail.webp`;
    await Promise.all([
      this.r2.upload(PUBLIC_BUCKET, desktopKey, desktop, 'image/webp'),
      this.r2.upload(PUBLIC_BUCKET, thumbKey, thumbnail, 'image/webp'),
    ]);

    // 5. Update media record
    await this.mediaRepo.update(mediaId, {
      processing_status: 'completed',
      preview_url: `${R2_PUBLIC_URL}/${desktopKey}`,
      thumbnail_url: `${R2_PUBLIC_URL}/${thumbKey}`,
      width: metadata.width,
      height: metadata.height,
    });

    // 6. Socket.io notify
    this.gateway.server.to(`user:${uploadedBy}`).emit('media:ready', {
      id: mediaId, thumbnail_url, desktop_url, status: 'completed'
    });
  }
}
```

**Buoc 6: Media Controller**
```
POST /media/upload: @AdminOnly(), @UseInterceptors(FileInterceptor('file'))
  - Validate, call service.upload()
GET /media: @AdminOnly(), pagination + status filter
GET /media/:id: @Auth(), return metadata
DELETE /media/:id: @AdminOnly(), check khong dang dung trong published project
```

### Frontend Implementation

```
frontend/src/components/admin/
├── ImageUploader.tsx    # Dropzone, progress bar, status tracking
├── GalleryEditor.tsx    # Drag-drop reorder, add/remove images
└── MediaPicker.tsx      # Modal chon anh tu media library

Logic:
1. ImageUploader: POST /media/upload (FormData)
   - Hien thi progress bar
   - Sau upload: hien skeleton cho den khi nhan Socket.io 'media:ready'
   - Neu status='failed': hien error message

2. GalleryEditor: Dung cho project gallery va product images
   - useSortable (dnd-kit) cho drag-drop reorder
   - Button "Add Images" → mo MediaPicker modal
   - Click X → xoa association (khong xoa media)

3. MediaPicker: Modal voi grid thumbnails
   - Load: GET /media?status=completed&page=1
   - Select multiple → return selected media IDs
```

### Testing Checklist

- [ ] Upload JPEG/PNG/WebP → 201, status 'pending'
- [ ] Upload PDF gia dang .jpg → 400 (magic bytes check)
- [ ] Upload > 20MB → 413
- [ ] IMAGE_JOB tao desktop + thumbnail WebP
- [ ] Socket.io emit 'media:ready' khi xong
- [ ] Failed processing → status='failed', error logged
- [ ] Delete media dang dung trong published project → 409
- [ ] Signed URL expire sau 1h
