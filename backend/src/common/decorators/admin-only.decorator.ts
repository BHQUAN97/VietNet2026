import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../../modules/users/entities/user.entity';

/**
 * Composite decorator: JWT auth + ADMIN/SUPER_ADMIN role check.
 * Replaces: @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 */
export const AdminOnly = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  );

/**
 * Composite decorator: JWT auth + ADMIN/SUPER_ADMIN/EDITOR role check.
 * Cho phep Editor tao/sua noi dung (articles, projects, products).
 */
export const EditorOnly = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.EDITOR),
  );
