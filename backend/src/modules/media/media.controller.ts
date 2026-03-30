import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';
import { MediaService } from './media.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

const MAX_IMAGE_DIMENSION = 10000; // 10000x10000 max to prevent DOS

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * POST /media/upload
   * Upload a single image file. Authenticated users only.
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|gif)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    // Guard: validate image dimensions to prevent DOS via huge images
    try {
      const metadata = await sharp(file.buffer).metadata();
      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION)
      ) {
        throw new BadRequestException(
          `Image dimensions too large: ${metadata.width}x${metadata.height}. Maximum: ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}`,
        );
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Unable to read image metadata. File may be corrupted.');
    }

    const media = await this.mediaService.upload(file, req.user.id);
    return ok(media, 'File uploaded successfully');
  }

  /**
   * GET /media
   * List all media (paginated). Admin only.
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.mediaService.findAll(pagination);
    return paginated(result.data, {
      page: result.meta.page,
      limit: result.meta.limit,
      total: result.meta.total,
    });
  }

  /**
   * GET /media/:id
   * Get a single media by ID.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const media = await this.mediaService.findById(id);
    return ok(media);
  }

  /**
   * DELETE /media/:id
   * Soft delete a media record. Admin only.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.mediaService.softDelete(id);
    return ok(null, 'Media deleted successfully');
  }
}
