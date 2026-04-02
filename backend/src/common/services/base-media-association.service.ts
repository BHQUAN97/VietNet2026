import { Repository, ObjectLiteral } from 'typeorm';
import { validateUlid } from '../helpers/ulid.helper';
import { BadRequestException } from '@nestjs/common';
import { ActionLogger } from '../helpers/logger.helper';

interface SyncMediaOptions {
  /** Them is_primary = true cho item dau tien (Products dung, Projects khong) */
  withPrimary?: boolean;
}

/**
 * BaseMediaAssociationHelper — utility class gom logic pivot table media.
 * Thay the updateImages (Products) + updateGallery (Projects) trung lap.
 *
 * Khong phai Injectable service — goi truc tiep tu service layer.
 * Ly do: moi module co repo rieng (ProductImage vs ProjectGallery),
 * nen dung helper pattern linh hoat hon DI.
 *
 * Usage trong service:
 *   import { MediaAssociation } from '../../common/services/base-media-association.service';
 *
 *   // Sync images
 *   await MediaAssociation.sync(this.productImagesRepository, {
 *     entityIdField: 'product_id',
 *     entityId: productId,
 *     mediaIds: ['ulid1', 'ulid2'],
 *   }, { withPrimary: true });
 *
 *   // Get images
 *   const images = await MediaAssociation.getMedia(this.productImagesRepository, {
 *     entityIdField: 'product_id',
 *     entityId: productId,
 *   });
 */
export class MediaAssociation {
  private static readonly logger = new ActionLogger('MediaAssociation');

  /**
   * Sync media IDs cho 1 entity.
   * Delete existing -> Insert new voi display_order (+ is_primary neu options.withPrimary).
   */
  static async sync<T extends ObjectLiteral>(
    repo: Repository<T>,
    config: {
      entityIdField: string;
      entityId: string;
      mediaIds: string[];
    },
    options?: SyncMediaOptions,
  ): Promise<T[]> {
    const { entityIdField, entityId, mediaIds } = config;
    const { withPrimary = false } = options || {};

    // Validate tat ca media IDs
    for (const id of mediaIds) {
      if (!validateUlid(id)) {
        throw new BadRequestException(`Invalid media ID format: ${id}`);
      }
    }

    // Delete existing
    await repo.delete({ [entityIdField]: entityId } as any);

    if (mediaIds.length === 0) return [];

    // Insert new
    const entries = mediaIds.map((mediaId, index) => {
      const entry: Record<string, unknown> = {
        [entityIdField]: entityId,
        media_id: mediaId,
        display_order: index,
      };
      if (withPrimary) {
        entry.is_primary = index === 0;
      }
      return repo.create(entry as any);
    });

    const saved = await repo.save(entries as any);

    this.logger.log(
      `Synced ${mediaIds.length} media for ${entityIdField}=${entityId}`,
    );

    return saved as unknown as T[];
  }

  /**
   * Get media entries cho 1 entity, sorted by display_order.
   */
  static async getMedia<T extends ObjectLiteral>(
    repo: Repository<T>,
    config: {
      entityIdField: string;
      entityId: string;
    },
  ): Promise<T[]> {
    return repo.find({
      where: { [config.entityIdField]: config.entityId } as any,
      relations: ['media'],
      order: { display_order: 'ASC' } as any,
    });
  }
}
