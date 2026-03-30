import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BaseService } from '../../common/base/base.service';
import { Media, MediaProcessingStatus } from './entities/media.entity';
import { R2StorageService } from '../../common/services/r2-storage.service';
import { validateUlid } from '../../common/helpers/ulid.helper';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

@Injectable()
export class MediaService extends BaseService<Media> {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly r2Storage: R2StorageService,
    @InjectQueue('image-processing') private readonly imageQueue: Queue,
  ) {
    super(mediaRepo);
  }

  /**
   * Upload a file: validate, persist entity, upload original to R2, enqueue IMAGE_JOB.
   */
  async upload(
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<Media> {
    // Guard: validate ULID
    if (!validateUlid(uploadedBy)) {
      throw new BadRequestException('Invalid uploadedBy user ID');
    }

    // Guard: validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Guard: validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large: ${file.size} bytes. Maximum: ${MAX_FILE_SIZE} bytes (20MB)`,
      );
    }

    // Create media entity with pending status
    const media = this.mediaRepo.create({
      original_filename: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      original_url: '', // Will be set after R2 upload
      processing_status: MediaProcessingStatus.PENDING,
      uploaded_by: uploadedBy,
    });

    // Save to get the generated ULID
    const saved = await this.mediaRepo.save(media);

    // Upload original to R2 private bucket
    const r2Key = `media/${saved.id}/${file.originalname}`;
    try {
      const originalUrl = await this.r2Storage.upload(
        'private',
        r2Key,
        file.buffer,
        file.mimetype,
      );

      // Update with the R2 URL
      saved.original_url = originalUrl;
      await this.mediaRepo.update(saved.id, { original_url: originalUrl });
    } catch (err: any) {
      // Clean up the DB record if R2 upload fails
      await this.mediaRepo.delete(saved.id);
      this.logger.error(
        `R2 upload failed for media ${saved.id}: ${err?.message}`,
      );
      throw new BadRequestException('File upload failed. Please try again.');
    }

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

    this.logger.log(
      `Media ${saved.id} uploaded and queued for processing`,
    );

    return saved;
  }

  /**
   * Find multiple media by IDs (for associations with projects, etc.).
   */
  async findByIds(ids: string[]): Promise<Media[]> {
    if (!ids.length) return [];

    // Validate all IDs
    for (const id of ids) {
      if (!validateUlid(id)) {
        throw new BadRequestException(`Invalid media ID: ${id}`);
      }
    }

    return this.mediaRepo.find({
      where: { id: In(ids), deleted_at: IsNull() },
    });
  }

  /**
   * Soft delete a media record (sets deleted_at).
   */
  async softDelete(id: string): Promise<void> {
    if (!validateUlid(id)) {
      throw new BadRequestException(`Invalid media ID: ${id}`);
    }

    const media = await this.mediaRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!media) {
      throw new NotFoundException(`Media with id ${id} not found`);
    }

    await this.mediaRepo.update(id, { deleted_at: new Date() });

    this.logger.log(`Media ${id} soft-deleted`);
  }

  /**
   * Override findById to exclude soft-deleted records.
   */
  async findById(id: string): Promise<Media> {
    if (!validateUlid(id)) {
      throw new BadRequestException(`Invalid media ID: ${id}`);
    }

    const media = await this.mediaRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!media) {
      throw new NotFoundException(`Media with id ${id} not found`);
    }

    return media;
  }
}
