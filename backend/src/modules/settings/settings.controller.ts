import { Controller, Get, Put, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ok } from '../../common/helpers/response.helper';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/settings
   * Admin only — get all settings grouped by setting_group.
   */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  async findAll() {
    const grouped = await this.settingsService.findAllGrouped();
    return ok(grouped);
  }

  /**
   * GET /api/settings/:group
   * Admin only — get all settings for a specific group.
   */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get(':group')
  async findByGroup(@Param('group') group: string) {
    const settings = await this.settingsService.findByGroup(group);
    return ok(settings);
  }

  /**
   * PUT /api/settings/:key
   * Admin only — upsert a setting by key.
   */
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put(':key')
  async upsert(
    @Param('key') key: string,
    @Body() dto: UpsertSettingDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id as string | undefined;

    const setting = await this.settingsService.upsert(
      key,
      dto.value,
      dto.group,
      userId,
    );

    return ok(setting, 'Setting updated');
  }
}
