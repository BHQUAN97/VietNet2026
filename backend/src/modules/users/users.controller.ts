import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ok, paginated } from '../../common/helpers/response.helper';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { ParseUlidPipe } from '../../common/pipes/parse-ulid.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @AdminOnly()
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.usersService.findAll(pagination);
    return paginated(result.data, result.meta);
  }

  @Get(':id')
  @AdminOnly()
  async findOne(@Param('id', ParseUlidPipe) id: string) {
    const user = await this.usersService.findById(id);
    return ok(user);
  }

  @Post()
  @AdminOnly()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createWithPassword(dto);
    return ok(user, 'User created successfully');
  }

  @Patch(':id')
  @AdminOnly()
  async update(
    @Param('id', ParseUlidPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, dto);
    return ok(user, 'User updated successfully');
  }

  @Delete(':id')
  @AdminOnly()
  async remove(@Param('id', ParseUlidPipe) id: string) {
    await this.usersService.softDelete(id);
    return ok(null, 'User deleted successfully');
  }
}
