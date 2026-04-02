import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as sharp from 'sharp';
import {
  Media,
  MediaProcessingStatus,
} from '../modules/media/entities/media.entity';
import { R2StorageService } from '../common/services/r2-storage.service';

interface ImageJobData {
  mediaId: string;
  r2Key: string;
}

@Processor('image-processing')
export class ImageProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageProcessor.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly r2Storage: R2StorageService,
  ) {
    super();
  }

  async process(job: Job<ImageJobData>): Promise<void> {
    const { mediaId, r2Key } = job.data;

    this.logger.log(
      `Processing image job id=${job.id} mediaId=${mediaId} attempt=${job.attemptsMade + 1}`,
    );

    const media = await this.mediaRepo.findOneBy({ id: mediaId });
    if (!media) {
      this.logger.warn(`Media ${mediaId} not found, skipping job`);
      return;
    }

    // Update status to processing
    await this.mediaRepo.update(mediaId, {
      processing_status: MediaProcessingStatus.PROCESSING,
    });

    try {
      // 1. Download original from R2 private bucket
      const originalBuffer = await this.r2Storage.download('private', r2Key);

      // 2. Get image metadata (width, height)
      const metadata = await sharp(originalBuffer).metadata();
      const width = metadata.width ?? null;
      const height = metadata.height ?? null;

      // 3. Auto-rotate based on EXIF and strip ALL metadata
      const rotatedBuffer = await sharp(originalBuffer).rotate().toBuffer();

      // 4. Re-upload clean original (EXIF stripped) to R2
      await this.r2Storage.upload('private', r2Key, rotatedBuffer, media.mime_type);

      // 5. Generate thumbnail: 300x300 cover crop, WebP 80%
      const thumbnailBuffer = await sharp(rotatedBuffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      // 6. Generate preview: max 1200px wide, preserve aspect ratio, WebP 80%
      const previewBuffer = await sharp(rotatedBuffer)
        .resize(1200, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // 7. Upload thumbnail and preview to R2 public bucket
      const thumbKey = `media/${mediaId}/thumb.webp`;
      const previewKey = `media/${mediaId}/preview.webp`;

      const [thumbnailUrl, previewUrl] = await Promise.all([
        this.r2Storage.upload('public', thumbKey, thumbnailBuffer, 'image/webp'),
        this.r2Storage.upload(
          'public',
          previewKey,
          previewBuffer,
          'image/webp',
        ),
      ]);

      // 8. Update media entity with processed data
      await this.mediaRepo.update(mediaId, {
        thumbnail_url: thumbnailUrl,
        preview_url: previewUrl,
        width,
        height,
        processing_status: MediaProcessingStatus.COMPLETED,
        processing_error: null,
      });

      this.logger.log(
        `Image processing completed for media ${mediaId} (${width}x${height})`,
      );
    } catch (error: any) {
      this.logger.error(
        `Image processing failed for media ${mediaId}: ${error?.message}`,
      );

      await this.mediaRepo.update(mediaId, {
        processing_status: MediaProcessingStatus.FAILED,
        processing_error: error?.message ?? 'Unknown processing error',
      });

      throw error; // Re-throw for BullMQ retry
    }
  }
}
