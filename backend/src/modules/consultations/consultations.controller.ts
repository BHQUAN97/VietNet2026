import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { QueryConsultationDto } from './dto/query-consultation.dto';
import { Public } from '../../common/decorators/public.decorator';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';
import { ok, paginated } from '../../common/helpers/response.helper';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  /**
   * POST /consultations — Public: submit a consultation request.
   */
  @Public()
  @Post()
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 requests per minute per IP
  async submit(@Body() dto: CreateConsultationDto, @Req() req: Request) {
    const consultation = await this.consultationsService.submit(
      dto,
      req.ip,
      req.headers['user-agent'],
    );

    return ok(
      { id: consultation.id },
      'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
    );
  }

  /**
   * GET /consultations — Admin: list consultations with pagination, status filter, search.
   */
  @Get()
  @AdminOnly()
  async findAllAdmin(@Query() query: QueryConsultationDto) {
    const { status, search, ...pagination } = query;
    const filters = { status, search };
    const result = await this.consultationsService.findAllAdmin(
      pagination,
      filters,
    );
    return paginated(result.data, result.meta);
  }

  /**
   * GET /consultations/:id — Admin: get consultation detail.
   */
  @Get(':id')
  @AdminOnly()
  async findOne(@Param('id', ParseUlidPipe) id: string) {
    const consultation = await this.consultationsService.findByIdAdmin(id);
    return ok(consultation);
  }

  /**
   * PATCH /consultations/:id — Admin: update status, notes, or assignee.
   */
  @Patch(':id')
  @AdminOnly()
  async update(
    @Param('id', ParseUlidPipe) id: string,
    @Body() dto: UpdateConsultationDto,
    @CurrentUser('id') userId: string,
  ) {
    const consultation = await this.consultationsService.updateAdmin(
      id,
      dto,
      userId,
    );
    return ok(consultation, 'Consultation updated successfully');
  }

  /**
   * DELETE /consultations/:id — Admin: soft delete a consultation.
   */
  @Delete(':id')
  @AdminOnly()
  async remove(@Param('id', ParseUlidPipe) id: string) {
    await this.consultationsService.softDelete(id);
    return ok(null, 'Consultation deleted successfully');
  }
}
