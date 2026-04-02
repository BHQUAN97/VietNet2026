import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { BaseService } from '../../common/base/base.service';

@Injectable()
export class SettingsService extends BaseService<Setting> {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,
  ) {
    super(settingRepo, 'Setting');
  }

  /**
   * Find a setting by its unique key.
   */
  async findByKey(key: string): Promise<Setting | null> {
    return this.settingRepo.findOne({
      where: { setting_key: key },
    });
  }

  /**
   * Find all settings within a group.
   */
  async findByGroup(group: string): Promise<Setting[]> {
    return this.settingRepo.find({
      where: { setting_group: group },
      order: { setting_key: 'ASC' },
    });
  }

  /**
   * Get all settings, grouped by setting_group.
   */
  async findAllGrouped(): Promise<Record<string, Setting[]>> {
    const all = await this.settingRepo.find({
      order: { setting_group: 'ASC', setting_key: 'ASC' },
    });

    const grouped: Record<string, Setting[]> = {};
    for (const setting of all) {
      if (!grouped[setting.setting_group]) {
        grouped[setting.setting_group] = [];
      }
      grouped[setting.setting_group].push(setting);
    }

    return grouped;
  }

  /**
   * Insert or update a setting by key.
   * If key exists, update value and group. Otherwise, create new.
   */
  async upsert(
    key: string,
    value: string,
    group: string,
    updatedBy?: string,
  ): Promise<Setting> {
    const existing = await this.findByKey(key);

    if (existing) {
      existing.setting_value = value;
      existing.setting_group = group;
      if (updatedBy) {
        existing.updated_by = updatedBy;
      }
      return this.settingRepo.save(existing);
    }

    const setting = this.settingRepo.create({
      setting_key: key,
      setting_value: value,
      setting_group: group,
      updated_by: updatedBy || null,
    });

    return this.settingRepo.save(setting);
  }
}
