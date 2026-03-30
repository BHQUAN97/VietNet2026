import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './entities/user.entity';
import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { validateUlid } from '../../common/helpers/ulid.helper';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }

  /**
   * Hook: validate email uniqueness before creating a user.
   */
  protected async beforeSave(data: DeepPartial<User>): Promise<DeepPartial<User>> {
    if (data.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: data.email as string, deleted_at: IsNull() },
      });
      if (existing) {
        throw new ConflictException('Email already exists');
      }
    }
    return data;
  }

  /**
   * Override findAll to exclude soft-deleted users.
   */
  async findAll(pagination: PaginationDto) {
    const { page, limit, sort, order } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.usersRepository.findAndCount({
      where: { deleted_at: IsNull() },
      skip,
      take: limit,
      order: { [sort]: order } as Record<string, 'ASC' | 'DESC'>,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Override findById to exclude soft-deleted users.
   */
  async findById(id: string): Promise<User> {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const entity = await this.usersRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });
    if (!entity) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return entity;
  }

  /**
   * Find user by ID, returning null if not found (no exception).
   * Includes password_hash and role for auth checks.
   */
  async findByIdSafe(id: string): Promise<User | null> {
    if (!validateUlid(id)) {
      return null;
    }

    return this.usersRepository.findOne({
      where: { id, deleted_at: IsNull() },
      select: [
        'id',
        'full_name',
        'email',
        'password_hash',
        'role',
        'status',
        'avatar_url',
      ],
    });
  }

  /**
   * Create a user with hashed password. Password hashing belongs in service layer.
   */
  async createWithPassword(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.create({
      full_name: dto.full_name,
      email: dto.email,
      password_hash: passwordHash,
      phone: dto.phone || null,
      role: dto.role,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'full_name',
        'email',
        'password_hash',
        'role',
        'status',
        'avatar_url',
        'refresh_token_hash',
      ],
    });
  }

  async updateRefreshToken(userId: string, hash: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refresh_token_hash: hash });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { last_login_at: new Date() });
  }

  /**
   * Soft delete a user by setting deleted_at timestamp.
   */
  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.update(user.id, { deleted_at: new Date() });
  }

  /**
   * Update user status (active, inactive, banned).
   */
  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findById(id);
    await this.usersRepository.update(user.id, { status });
    return this.findById(id);
  }
}
