import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { validateUlid } from '../../common/helpers/ulid.helper';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.usersService.findAll(pagination);
    return paginated(result.data, result.meta);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.usersService.findById(id);
    return ok(user);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createWithPassword(dto);
    return ok(user, 'User created successfully');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const user = await this.usersService.update(id, dto);
    return ok(user, 'User updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!validateUlid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    await this.usersService.softDelete(id);
    return ok(null, 'User deleted successfully');
  }
}
