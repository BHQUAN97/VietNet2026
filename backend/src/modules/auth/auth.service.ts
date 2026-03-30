import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { generateUlid } from '../../common/helpers/ulid.helper';
import { UserRole, UserStatus } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
  ) {}

  // ─── Rate Limiting ─────────────────────────────────────────────

  /**
   * Check if the IP is blocked due to too many failed login attempts.
   * Rule: 5 failed attempts in 10 minutes => 30-minute block.
   */
  async checkLoginRateLimit(ip: string): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Check if there's a block still active (5+ fails in the last 30 min window)
    const recentFailedCount = await this.loginAttemptRepository.count({
      where: {
        ip_address: ip,
        success: false,
        attempted_at: MoreThan(thirtyMinutesAgo),
      },
    });

    if (recentFailedCount >= 5) {
      throw new HttpException(
        'Too many failed login attempts. Try again after 30 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Record a login attempt (success or failure) for rate limiting.
   */
  async recordLoginAttempt(
    ip: string,
    email: string,
    success: boolean,
  ): Promise<void> {
    const attempt = this.loginAttemptRepository.create({
      ip_address: ip,
      email,
      success,
    });
    await this.loginAttemptRepository.save(attempt);
  }

  // ─── Login ─────────────────────────────────────────────────────

  async login(dto: LoginDto, ip: string, userAgent?: string) {
    // Guard: rate limit check
    await this.checkLoginRateLimit(ip);

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      await this.recordLoginAttempt(ip, dto.email, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      await this.recordLoginAttempt(ip, dto.email, false);
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      await this.recordLoginAttempt(ip, dto.email, false);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Success — record and generate tokens
    await this.recordLoginAttempt(ip, dto.email, true);

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent);
    await this.usersService.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      ...tokens,
    };
  }

  // ─── Register ──────────────────────────────────────────────────

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      id: generateUlid(),
      full_name: dto.full_name,
      email: dto.email,
      password_hash: passwordHash,
      phone: dto.phone || null,
      role: UserRole.VIEWER,
      status: UserStatus.ACTIVE,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  // ─── Refresh Tokens ────────────────────────────────────────────

  /**
   * Refresh token rotation:
   * 1. Verify the JWT refresh token to extract userId
   * 2. Find the stored token hash for this user
   * 3. Compare the raw token against the hash
   * 4. Revoke the old token, issue a new pair
   */
  async refreshTokens(
    userId: string,
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ) {
    // Find user by ID (fixed: was incorrectly calling findByEmail)
    const user = await this.usersService.findByIdSafe(userId);
    if (!user) {
      throw new UnauthorizedException('Access denied');
    }

    // Find a valid (non-revoked, non-expired) refresh token for this user
    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        user_id: userId,
        revoked_at: IsNull(),
      },
      order: { created_at: 'DESC' },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Check expiration
    if (new Date() > storedToken.expires_at) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Verify hash
    const isValid = await bcrypt.compare(refreshToken, storedToken.token_hash);
    if (!isValid) {
      // Possible token theft — revoke all tokens for this user
      await this.revokeAllUserTokens(userId);
      throw new UnauthorizedException('Access denied');
    }

    // Revoke old token
    storedToken.revoked_at = new Date();
    await this.refreshTokenRepository.save(storedToken);

    // Generate new pair
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ip, userAgent);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Verify refresh token JWT and delegate to refreshTokens.
   * Keeps JWT verification logic in the service layer.
   */
  async verifyAndRefreshTokens(
    refreshToken: string,
    ip?: string,
    userAgent?: string,
  ) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.refreshTokens(payload.sub, refreshToken, ip, userAgent);
  }

  // ─── Logout ────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.revokeAllUserTokens(userId);
  }

  // ─── Private Helpers ───────────────────────────────────────────

  /**
   * Store a hashed refresh token in the refresh_tokens table.
   */
  private async storeRefreshToken(
    userId: string,
    rawToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const refreshExpiresInSec = this.configService.get<number>(
      'jwt.refreshExpiresIn',
      604800,
    );
    const expiresAt = new Date(Date.now() + refreshExpiresInSec * 1000);

    const entity = this.refreshTokenRepository.create({
      id: generateUlid(),
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: ip || '0.0.0.0',
      user_agent: userAgent || null,
    });

    await this.refreshTokenRepository.save(entity);
  }

  /**
   * Revoke all active refresh tokens for a user.
   */
  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({ revoked_at: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .execute();
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<number>('jwt.expiresIn', 3600),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<number>('jwt.refreshExpiresIn', 604800),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
