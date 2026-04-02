import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './entities/user.entity';
import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    super(usersRepository, 'User');
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
   * Override findAll to exclude soft-deleted users with sort allowlist.
   */
  async findAll(pagination: PaginationDto) {
    const qb = this.createBaseQuery('u');

    return this.executePaginatedQuery(qb, 'u', pagination, {
      sortAllowlist: {
        created_at: 'u.created_at',
        updated_at: 'u.updated_at',
        full_name: 'u.full_name',
        email: 'u.email',
        status: 'u.status',
        name: 'u.full_name',
      },
    });
  }

  /**
   * Override findById to exclude soft-deleted users.
   */
  async findById(id: string): Promise<User> {
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
      where: { email, deleted_at: IsNull() },
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
   * Update user status (active, inactive, banned).
   */
  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findById(id);
    await this.usersRepository.update(user.id, { status });
    return this.findById(id);
  }
}
