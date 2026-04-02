import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BaseService } from '../../common/base/base.service';
import { Media, MediaProcessingStatus } from './entities/media.entity';
import { R2StorageService } from '../../common/services/r2-storage.service';
import { sanitizeFilename } from '../../common/helpers/file-validator';
import { generateUlid } from '../../common/helpers/ulid.helper';

@Injectable()
export class MediaService extends BaseService<Media> {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly r2Storage: R2StorageService,
    @InjectQueue('image-processing') private readonly imageQueue: Queue,
  ) {
    super(mediaRepo, 'Media');
  }

  /**
   * Upload a file: upload original to R2, persist entity, enqueue IMAGE_JOB.
   * Validation (MIME, size) is handled by controller via validateUploadedFile().
   */
  async upload(
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<Media> {
    // Guard: validate ULID format cua uploadedBy
    this.validateForeignKeys({ uploaded_by: uploadedBy } as any, [
      'uploaded_by',
    ]);

    // Sanitize filename va tao R2 key truoc khi luu
    const safeName = sanitizeFilename(file.originalname);
    const tempId = generateUlid();
    const r2Key = `media/${tempId}/${safeName}`;

    // Upload to R2 FIRST — khong luu DB voi empty URL
    let originalUrl: string;
    try {
      originalUrl = await this.r2Storage.upload(
        'private',
        r2Key,
        file.buffer,
        file.mimetype,
      );
    } catch (err: any) {
      this.actionLogger.error(`R2 upload failed: ${err?.message}`);
      throw new BadRequestException('File upload failed. Please try again.');
    }

    // Save to DB chi sau khi R2 upload thanh cong
    const media = this.mediaRepo.create({
      original_filename: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      original_url: originalUrl,
      processing_status: MediaProcessingStatus.PENDING,
      uploaded_by: uploadedBy,
    });
    // Override auto-generated ID to match R2 key
    media.id = tempId;
    const saved = await this.mediaRepo.save(media);

    // Enqueue IMAGE_JOB for processing
    await this.imageQueue.add(
      'process-image',
      {
        mediaId: saved.id,
        r2Key,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { age: 24 * 60 * 60 }, // 24 hours
        removeOnFail: { age: 7 * 24 * 60 * 60 }, // 7 days
      },
    );

    this.actionLogger.log(`Media ${saved.id} uploaded and queued for processing`);

    return saved;
  }

  /**
   * Find multiple media by IDs (for associations with projects, etc.).
   * Validate ULID format truoc khi query.
   */
  async findByIds(ids: string[]): Promise<Media[]> {
    if (!ids.length) return [];

    // Validate all IDs via base helper
    const fakeData: Record<string, string> = {};
    ids.forEach((id, i) => (fakeData[`media_id_${i}`] = id));
    this.validateForeignKeys(fakeData as any, Object.keys(fakeData));

    return this.mediaRepo.find({
      where: { id: In(ids), deleted_at: IsNull() },
    });
  }
}
