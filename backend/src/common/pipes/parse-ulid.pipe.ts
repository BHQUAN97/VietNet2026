import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { validateUlid } from '../helpers/ulid.helper';

/**
 * Pipe validates ULID format at @Param level.
 * Usage: @Param('id', ParseUlidPipe) id: string
 */
@Injectable()
export class ParseUlidPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!validateUlid(value)) {
      const field = metadata.data || 'id';
      throw new BadRequestException(`Invalid ULID format for "${field}"`);
    }
    return value;
  }
}
