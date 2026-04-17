import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/helpers/response.helper';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 req/min per IP — chong brute force
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.login(dto, ip, userAgent);

    res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ok({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.register(dto, ip, userAgent);

    res.cookie('refresh_token', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ok({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 20 } }) // 20 req/min per IP — chong spam refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    const tokens = await this.authService.verifyAndRefreshTokens(
      refreshToken,
      ip,
      userAgent,
    );

    res.cookie('refresh_token', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ok({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return ok(null, 'Logged out successfully');
  }

  @Get('me')
  async me(@CurrentUser() user: Record<string, unknown>) {
    return ok(user);
  }

  // ─── Password Reset ────────────────────────────────────────────

  @Public()
  @Throttle({ default: { ttl: 10 * 60 * 1000, limit: 3 } }) // 3 req / 10 min per IP
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(dto.email);
    // Always return success message (prevent email enumeration)
    return ok(null, 'If email exists, reset link has been sent');
  }

  @Public()
  @Throttle({ default: { ttl: 60 * 1000, limit: 5 } }) // 5 req / min per IP
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return ok(null, 'Password has been reset');
  }

  // POST /auth/verify-email — not implemented: project does not have an
  // EmailVerificationToken entity yet. Add when email verification is required.
}
