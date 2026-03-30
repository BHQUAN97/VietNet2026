import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../dto/pagination.dto';

/**
 * Template Method pattern for CRUD services.
 * Subclasses can override hooks: beforeSave, validate, afterSave, beforeDelete, afterDelete.
 */
export abstract class BaseService<T extends { id: string }> {
  constructor(protected readonly repository: Repository<T>) {}

  /**
   * Hook: runs before validation. Override to mutate/enrich data.
   */
  protected async beforeSave(_data: DeepPartial<T>): Promise<DeepPartial<T>> {
    return _data;
  }

  /**
   * Hook: validate business rules. Throw HttpException on failure.
   */
  protected async validate(_data: DeepPartial<T>): Promise<void> {
    // Override in subclass to add validation
  }

  /**
   * Hook: persist data to DB. Override for custom save logic.
   */
  protected async saveData(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Hook: runs after successful save. Override for side effects (events, cache, etc).
   */
  protected async afterSave(_entity: T): Promise<void> {
    // Override in subclass
  }

  /**
   * Template method: beforeSave -> validate -> saveData -> afterSave
   */
  async create(data: DeepPartial<T>): Promise<T> {
    const enriched = await this.beforeSave(data);
    await this.validate(enriched);
    const entity = await this.saveData(enriched);
    await this.afterSave(entity);
    return entity;
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit, sort, order } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      order: { [sort]: order } as any,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    await this.findById(id); // throws if not found
    const enriched = await this.beforeSave(data);
    await this.validate(enriched);
    await this.repository.update(id, data as any);
    const updated = await this.findById(id);
    await this.afterSave(updated);
    return updated;
  }

  protected async beforeDelete(_entity: T): Promise<void> {
    // Override in subclass
  }

  protected async afterDelete(_entity: T): Promise<void> {
    // Override in subclass
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.beforeDelete(entity);
    await this.repository.delete(id);
    await this.afterDelete(entity);
  }
}
