import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { ok } from '../../common/helpers/response.helper';

class RevalidateDto {
  @IsString()
  secret!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paths?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

@Controller('revalidate')
export class RevalidateController {
  private readonly logger = new Logger(RevalidateController.name);

  @Post()
  @Public()
  async revalidate(@Body() body: RevalidateDto) {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret || body.secret !== secret) {
      throw new UnauthorizedException('Invalid revalidation secret');
    }

    const revalidated: string[] = [];

    // Log paths and tags that were requested for revalidation.
    // The actual ISR revalidation happens on the Next.js side —
    // this endpoint acts as a relay/audit log.
    if (body.paths?.length) {
      revalidated.push(...body.paths.map((p) => `path:${p}`));
    }
    if (body.tags?.length) {
      revalidated.push(...body.tags.map((t) => `tag:${t}`));
    }

    // Forward to Next.js revalidation endpoint
    const nextUrl = process.env.NEXT_REVALIDATE_URL || 'http://localhost:3000';
    try {
      const response = await fetch(
        `${nextUrl}/api/revalidate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: body.secret,
            paths: body.paths,
            tags: body.tags,
          }),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `Next.js revalidation returned ${response.status}`,
        );
      }
    } catch (err) {
      this.logger.warn(`Failed to reach Next.js revalidation: ${err}`);
    }

    this.logger.log(`Revalidation triggered: ${revalidated.join(', ')}`);
    return ok({ revalidated }, 'Revalidation triggered');
  }
}
